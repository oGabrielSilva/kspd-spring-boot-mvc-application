import { hideModal, showModal } from '../../libs/Bulma';
import { forbidden } from '../../utilities/forbidden';
import { tools as getKassiopeiaTools } from '../../utilities/tools';
import { StackValidation } from '../../validations/StackValidation';

export class StackForm {
  private static readonly formId = 'modal-create-stack';
  readonly tools = getKassiopeiaTools();

  readonly form;
  private readonly nameInput;
  private readonly descriptionInput;
  private readonly descriptionHelper;
  private readonly validation = new StackValidation();

  private readonly successMessage;

  constructor(
    private readonly slug: string = null,
    private execAfterCreate: (stack: Stack) => void = () => {}
  ) {
    this.form = document.getElementById(StackForm.formId) as HTMLFormElement;
    this.nameInput = this.form.querySelector('#stack-name') as HTMLInputElement;
    this.descriptionInput = this.form.querySelector<HTMLTextAreaElement>('#stack-description');
    this.descriptionHelper = this.form.querySelector('.description-len');
    this.successMessage = this.form.dataset.message;
  }

  private listenName() {
    this.nameInput.addEventListener('input', () => {
      if (this.validation.isNameNonValid(this.nameInput.value))
        this.nameInput.classList.add('is-danger');
      else this.nameInput.classList.remove('is-danger');
    });
  }

  private listenDescription() {
    this.descriptionInput.addEventListener('input', () => {
      if (this.validation.isDescriptionNonValid(this.descriptionInput.value))
        this.descriptionInput.classList.add('is-danger');
      else this.descriptionInput.classList.remove('is-danger');

      this.updateDescriptionHelper();
    });
  }

  private listenForm() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = this.nameInput.value.trim();
      if (name.length < 1 || name.length > 100) {
        this.tools.anim.shake(this.nameInput);
        return;
      }
      const description = this.descriptionInput.value.trim();
      if (this.validation.isDescriptionNonValid(description)) {
        this.tools.anim.shake(this.descriptionInput);
        return;
      }

      this.tools.screenProgress.show();
      try {
        const response = await fetch(this.apiURL(), {
          method: 'POST',
          body: JSON.stringify({ name, description }),
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
        });
        if (response.status === 403) return forbidden();
        if (!response.ok) {
          const { message } = await response.json();
          this.tools.toaster.danger(message);
          return;
        }
        const stack = (await response.json()) as Stack;
        this.execAfterCreate(stack);

        this.hide();
        this.tools.toaster.info(this.successMessage);
      } catch (error) {
        console.log(error);
        this.tools.toaster.danger();
      } finally {
        this.tools.screenProgress.hide();
      }
    });
  }

  private updateDescriptionHelper() {
    const len = this.descriptionInput.value.length;
    this.descriptionHelper.textContent = String(this.validation.descriptionMaxLen - len);
  }

  private apiURL() {
    return `/api/stack${typeof this.slug === 'string' ? '?article=' + this.slug : ''}`;
  }

  public listen() {
    this.listenName();
    this.listenDescription();
    this.listenForm();

    this.updateDescriptionHelper();
  }

  public set onCreate(cb: typeof this.execAfterCreate) {
    this.execAfterCreate = cb;
  }

  public show() {
    showModal(this.form);
  }

  public hide() {
    hideModal(this.form);
  }

  public static createAndListenFields(slug: string = null) {
    if (!StackForm.canRunIt()) return null;
    const instance = new StackForm(slug);
    instance.listen();
    return instance;
  }

  public static canRunIt() {
    return !!document.getElementById(StackForm.formId);
  }
}
