import { hideModal, showModal } from '../../../libs/Bulma';
import { forbidden } from '../../../utilities/forbidden';
import { generateHTML } from '../../../utilities/generateHtml';
import { tools } from '../../../utilities/tools';
import { addStackToTable } from './partials/addStackToTable';
import { listenCreateStackModal } from './partials/listenCreateStackModal';

export const stackTable = document.querySelector('table#stack-tb') as HTMLTableElement;
export let onClickRemoveStack: (button: HTMLButtonElement) => void;

export function metadataStacks(slug: string) {
  const form = document.querySelector('form#add-stack') as HTMLFormElement;
  const createStackModal = document.getElementById('modal-create-stack') as HTMLFormElement;
  const selectStack = form.querySelector('select');

  listenCreateStackModal(createStackModal, slug);

  onClickRemoveStack = (button) => {
    const stack = button.dataset.stack;
    confirmRemoveStack(stack);
    confirmRemoveStackModal.dataset.stack = stack;
  };

  stackTable.querySelectorAll('button').forEach((button) => {
    button.onclick = () => onClickRemoveStack(button);
  });

  form
    .querySelector<HTMLElement>('#create-stack')
    .addEventListener('click', () => showModal(createStackModal));

  const confirmStackModal = document.querySelector('#confirm-add-stack-modal') as HTMLFormElement;
  const confirmStackModalTitles = confirmStackModal.querySelectorAll('strong');

  listenConfirmStackIsAccepted(confirmStackModal, selectStack, slug);

  function confirmStack(stack: string) {
    confirmStackModalTitles.forEach((title) => (title.textContent = stack));
    showModal(confirmStackModal);
  }

  const confirmRemoveStackModal = document.getElementById(
    'confirm-remove-stack-modal'
  ) as HTMLFormElement;
  const confirmRemoveStackModalTitles = confirmRemoveStackModal.querySelectorAll('strong');

  listenConfirmRemoveStackIsAccepted(confirmRemoveStackModal, slug);

  function confirmRemoveStack(stack: string) {
    confirmRemoveStackModalTitles.forEach((title) => (title.textContent = stack));
    showModal(confirmRemoveStackModal);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    confirmStack(selectStack.value);
  });
}

async function listenConfirmStackIsAccepted(
  modal: HTMLFormElement,
  stackSelect: HTMLSelectElement,
  slug: string
) {
  const { screenProgress, toaster } = tools();
  const successMessage = modal.dataset.message;

  modal.addEventListener('submit', async (e) => {
    e.preventDefault();
    screenProgress.show();

    try {
      const response = await fetch(`/api/article/${slug}/stack`, {
        method: 'PATCH',
        body: JSON.stringify({ stack: stackSelect.value }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return;
      }
      stackSelect.querySelector(`option[value="${stackSelect.value}"]`)?.remove();
      addStackToTable(await response.json());
      toaster.info(successMessage);
      hideModal(modal);
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  });
}

async function listenConfirmRemoveStackIsAccepted(modal: HTMLFormElement, slug: string) {
  const { screenProgress, toaster } = tools();
  const successMessage = modal.dataset.message;
  const select = document.getElementById('add-stack').querySelector<HTMLSelectElement>('select');

  modal.addEventListener('submit', async (e) => {
    e.preventDefault();
    screenProgress.show();
    const stack = modal.dataset.stack;

    try {
      const response = await fetch(`/api/article/${slug}/stack`, {
        method: 'DELETE',
        body: JSON.stringify({ stack }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return;
      }
      stackTable.querySelector(`tr[data-stack="${stack}"]`)?.remove();
      select.appendChild(
        generateHTML({
          htmlType: 'option',
          attributes: [{ key: 'value', value: stack }],
          value: stack,
        })
      );
      toaster.info(successMessage);
      hideModal(modal);
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  });
}
