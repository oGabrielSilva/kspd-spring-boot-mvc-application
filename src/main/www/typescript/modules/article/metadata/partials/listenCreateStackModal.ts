import { hideModal } from '../../../../libs/Bulma';
import { forbidden } from '../../../../utilities/forbidden';
import { tools } from '../../../../utilities/tools';
import { addStackToTable } from './addStackToTable';

export async function listenCreateStackModal(form: HTMLFormElement, slug: string) {
  const { anim, toaster, screenProgress } = tools();
  const nameInput = form.querySelector('#stack-name') as HTMLInputElement;
  const descriptionInput = form.querySelector('#stack-description') as HTMLTextAreaElement;
  const descriptionHelper = form.querySelector('.description-len');
  const descriptionMaxLen = 160;

  const successMessage = form.dataset.message;

  nameInput.addEventListener('input', () => {
    if (nameInput.value.length > 100 || nameInput.value.trim().length < 1)
      nameInput.classList.add('is-danger');
    else nameInput.classList.remove('is-danger');
  });

  descriptionInput.addEventListener('input', () => {
    const len = descriptionInput.value.length;
    if (len > descriptionMaxLen) descriptionInput.classList.add('is-danger');
    else descriptionInput.classList.remove('is-danger');
    descriptionHelper.textContent = String(descriptionMaxLen - len);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (name.length < 1 || name.length > 100) {
      anim.shake(nameInput);
      return;
    }
    const description = descriptionInput.value.trim();
    if (description.length > descriptionMaxLen) {
      anim.shake(descriptionInput);
      return;
    }

    screenProgress.show();
    try {
      const response = await fetch('/api/stack?article=' + slug, {
        method: 'POST',
        body: JSON.stringify({ name, description }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return;
      }
      const stack = (await response.json()) as Stack;
      addStackToTable(stack, slug);
      hideModal(form);
      toaster.info(successMessage);
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  });
}
