import { showModal } from '../../libs/Bulma';
import { forbidden } from '../../utilities/forbidden';
import { tools } from '../../utilities/tools';

export function runIsAuthor(form: HTMLFormElement) {
  const { toaster, screenProgress } = tools();
  const start = document.querySelector('#start-new-article');

  start.addEventListener('click', () => showModal(form));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    screenProgress.show();

    try {
      const response = await fetch('/api/article', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return;
      }
      const content = (await response.json()) as Article;
      window.location.href = content.links.edit;
    } catch (error) {
      toaster.danger();
      console.log(error);
    } finally {
      screenProgress.hide();
    }
  });
}
