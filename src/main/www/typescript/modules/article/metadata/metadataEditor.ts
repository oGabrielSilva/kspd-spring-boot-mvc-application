import { hideModal, showModal } from '../../../libs/Bulma';
import { forbidden } from '../../../utilities/forbidden';
import { generateHTML } from '../../../utilities/generateHtml';
import { tools } from '../../../utilities/tools';

const metadataUserTable = document.getElementById('metadata-user-tb') as HTMLTableElement;
let metadataEditorSharedSlug: string;
let onButtonRemoveUserClicked: (email: string) => void;

export function metadataEditor(slug: string) {
  metadataEditorSharedSlug = slug;
  const { anim, screenProgress, toaster } = tools();
  const form = document.getElementById('form-add-new-editor');
  const input = form.querySelector('input');
  const dangerMessage = input.dataset.message;
  const nonAuthorMessage = form.dataset.nonAuthor;

  let selectedUser: User = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = input.value.trim();
    if (user.length < 1) {
      anim.shakeAll([input, form.querySelector('button[type="submit"]')]);
      return toaster.alert(dangerMessage);
    }

    screenProgress.show();

    try {
      const response = await fetch(`/api/user/${user}`, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        return toaster.danger(message);
      }
      const result = (await response.json()) as User;
      if (result.roles.indexOf('AUTHOR') === -1 || !result.isEmailChecked)
        return toaster.danger(nonAuthorMessage);
      selectedUser = result;
      updateConfirmAddEditorModalState();
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  });

  const confirmAddEditorModal = document.getElementById(
    'confirm-add-new-editor-modal'
  ) as HTMLFormElement;
  const editorAddedMessage = confirmAddEditorModal.dataset.message;
  const titles = confirmAddEditorModal.querySelectorAll('strong');
  const userEmail = confirmAddEditorModal.querySelector('#user-email');
  const userUsername = confirmAddEditorModal.querySelector('#user-username');

  function updateConfirmAddEditorModalState() {
    titles.forEach((t) => (t.textContent = selectedUser.name));
    userEmail.textContent = selectedUser.email;
    userUsername.textContent = selectedUser.username;

    showModal(confirmAddEditorModal);
  }

  confirmAddEditorModal.addEventListener('submit', async (e) => {
    e.preventDefault();

    screenProgress.show();

    try {
      const response = await fetch(`/api/article/${slug}/editors`, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
        body: JSON.stringify({ email: selectedUser.email }),
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        return toaster.danger(message);
      }
      metadataUserTable.tBodies[0].appendChild(generateUserTableRow(selectedUser));
      input.value = '';
      hideModal(confirmAddEditorModal);
      toaster.info(editorAddedMessage.replace('#', selectedUser.email));
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  });

  const confirmRemoveUserModal = document.getElementById(
    'confirm-remove-editor-modal'
  ) as HTMLFormElement;
  const confirmRemoveUserModalEmail = confirmRemoveUserModal.querySelector('strong');
  const removeUserSuccessMessage = confirmRemoveUserModal.dataset.message;

  onButtonRemoveUserClicked = (email) => {
    confirmRemoveUserModalEmail.textContent = email;
    confirmRemoveUserModal.dataset.hash = email;
    showModal(confirmRemoveUserModal);
  };

  confirmRemoveUserModal.onsubmit = async (e) => {
    e.preventDefault();
    const email = confirmRemoveUserModal.dataset.hash;
    const { screenProgress, toaster } = tools();

    screenProgress.show();

    try {
      const response = await fetch(`/api/article/${metadataEditorSharedSlug}/editors`, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
        body: JSON.stringify({ email }),
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        return toaster.danger(message);
      }
      metadataUserTable.tBodies[0].querySelector(`tr[data-hash="${email}"]`)?.remove();
      hideModal(confirmRemoveUserModal);
      toaster.info(removeUserSuccessMessage.replace('#', email));
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  };

  metadataUserTable.tBodies[0]
    .querySelectorAll('button')
    .forEach((button) => (button.onclick = () => onButtonRemoveUserClicked(button.dataset.hash)));
}

function generateUserTableRow(user: User) {
  return generateHTML({
    htmlType: 'tr',
    attributes: [
      { key: 'title', value: user.email },
      { key: 'data-hash', value: user.email },
    ],
    children: [
      {
        htmlType: 'td',
        value: user.email,
        attributes: [{ key: 'class', value: 'has-text-centered' }],
      },
      {
        htmlType: 'td',
        value: user.username,
        attributes: [{ key: 'class', value: 'has-text-centered' }],
      },
      {
        htmlType: 'td',
        value: user.roles[user.roles.length - 1],
        attributes: [{ key: 'class', value: 'has-text-centered' }],
      },
      {
        htmlType: 'td',
        value: metadataUserTable.dataset.no,
        attributes: [{ key: 'class', value: 'has-text-centered' }],
      },
      {
        htmlType: 'td',
        attributes: [{ key: 'class', value: 'has-text-centered' }],
        children: [
          {
            htmlType: 'button',
            attributes: [
              { key: 'type', value: 'button' },
              { key: 'data-hash', value: user.email },
              { key: 'class', value: 'button is-small is-danger remove-editor' },
              {
                key: 'title',
                value: metadataUserTable.dataset.buttonTitle.replace('#', user.name),
              },
            ],
            children: [
              { htmlType: 'i', attributes: [{ key: 'class', value: 'fa-solid fa-user-slash' }] },
            ],
            onClick: () => onButtonRemoveUserClicked(user.email),
          },
        ],
      },
    ],
  });
}
