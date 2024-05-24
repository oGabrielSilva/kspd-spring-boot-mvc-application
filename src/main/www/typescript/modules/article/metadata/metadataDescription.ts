import { forbidden } from '../../../utilities/forbidden';
import { tools } from '../../../utilities/tools';

export function metadataDescription(slug: string, form: HTMLFormElement) {
  const { anim, toaster, screenProgress } = tools();
  const maxSize = 160;
  const area = form.querySelector('#seo-description') as HTMLTextAreaElement;
  const original = area.dataset.original as string | undefined;
  const displaySize = form.querySelector('.description-len') as HTMLElement;

  area.addEventListener('input', () => {
    if (area.value.length > maxSize) area.classList.add('is-danger');
    else area.classList.remove('is-danger');
    displaySize.innerText = String(maxSize - area.value.length);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = area.value;
    if (description === original) {
      toaster.info(area.dataset.conflict);
      anim.shake(area);
      return;
    }
    if (description.length > maxSize) {
      anim.shake(area);
      return;
    }

    screenProgress.show();
    try {
      const response = await fetch(`/api/article/${slug}/description`, {
        body: JSON.stringify({ description }),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        method: 'PATCH',
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return;
      }
      toaster.success(area.dataset.message);
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  });
}
