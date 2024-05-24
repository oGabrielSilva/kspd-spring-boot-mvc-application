import { showModal } from '../../libs/Bulma';
import { forbidden } from '../../utilities/forbidden';
import { tools } from '../../utilities/tools';

export function runIsNonAuthor(isNonAuthorModal: HTMLElement) {
  const { toaster, screenProgress } = tools();
  const openIsNonAuthorModal = document.getElementById('show-is-non-author-modal');
  const confirm = isNonAuthorModal.querySelector('#become-author');

  openIsNonAuthorModal.addEventListener('click', () => {
    showModal(isNonAuthorModal);
  });

  confirm.addEventListener('click', () => {
    screenProgress.show();
    toaster.info(isNonAuthorModal.dataset.confirm);
    setTimeout(async () => {
      try {
        const response = await fetch('/api/user/become-author', {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.status === 403) return forbidden();
        if (!response.ok) {
          const { message } = await response.json();
          toaster.danger(message);
          return;
        }
        location.reload();
      } catch (error) {
        console.log(error);
        toaster.danger();
      } finally {
        screenProgress.hide();
      }
    }, 1500);
  });
}
