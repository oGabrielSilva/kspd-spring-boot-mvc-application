import { hideModal, showModal } from '../../libs/Bulma';
import { forbidden } from '../../utilities/forbidden';
import { tools } from '../../utilities/tools';
import { StackValidation } from '../../validations/StackValidation';

export class StackEditForm {
  private static readonly formId = 'modal-edit-stack';

  private readonly validation = new StackValidation();
  private readonly tools = tools();

  readonly form = document.getElementById(StackEditForm.formId);
  private nameField: HTMLElement = null;
  private nameInput: HTMLInputElement = null;
  private description: HTMLTextAreaElement = null;
  private successMessage: string = null;

  private stack: Stack;

  private execAfterUpdateStack: (newStack: Stack, oldStack: Stack) => void;

  private clean() {
    this.stack = null;
    this.nameField.textContent = '';
    this.nameInput.value = '';
    this.description.value = '';
    this.form.dataset.stack = '';
  }

  private async trySubmit() {
    if (!this.isActive) return this.tools.toaster.danger();

    const name = this.nameInput.value;
    if (this.validation.isNameNonValid(name)) {
      return this.tools.anim.shake(this.nameInput);
    }

    const description = this.description.value;
    if (this.validation.isDescriptionNonValid(description)) {
      return this.tools.anim.shake(this.description);
    }

    if (name === this.stack.name && description === this.stack.description) {
      return this.hide();
    }

    const body = JSON.stringify({
      ...(name !== this.stack.name ? { name } : {}),
      ...(description !== this.stack.description ? { description } : {}),
    });
    this.tools.screenProgress.show();

    try {
      const response = await fetch(encodeURI(`/api/stack/${this.stack.name}`), {
        method: 'PATCH',
        body,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        return this.tools.toaster.danger(message);
      }
      const stack = await response.json();
      this.execAfterUpdateStack(stack, this.stack);
      this.hide();
      this.clean();
    } catch (error) {
      console.log(error);
      this.tools.toaster.danger();
    } finally {
      this.tools.screenProgress.hide();
    }
  }

  public attachStack(stack: Stack) {
    this.stack = stack;
    this.nameField.textContent = stack.name;
    this.nameInput.value = stack.name;
    this.description.value = stack.description;
    this.form.dataset.stack = stack.name;
    return { showForm: () => this.show() };
  }

  public configureForm() {
    this.nameField = this.form.querySelector('strong.stack-name');
    this.nameInput = this.form.querySelector('input.stack-name');
    this.description = this.form.querySelector('textarea#stack-description');
    this.successMessage = this.form.dataset.message;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.trySubmit();
    });
  }

  public show() {
    showModal(this.form);
  }

  public hide() {
    hideModal(this.form);
  }

  public isActive() {
    return this.form && this.form.classList.contains('is-active') && this.stack && this.stack.name;
  }

  public set onUpdate(cb: typeof this.execAfterUpdateStack) {
    this.execAfterUpdateStack = cb;
  }

  public static canRunIt() {
    return !!document.getElementById(StackEditForm.formId);
  }
}
