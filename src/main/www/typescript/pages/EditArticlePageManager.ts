import { ArticleValidation } from '../validations/ArticleValidation';
import { forbidden } from '../utilities/forbidden';
import { TipTapBasedHTMLEditor } from '../modules/write/TipTapBasedHTMLEditor';
import { tools } from '../utilities/tools';

export interface UnsavedImages {
  blobs: Array<{ blob: Blob; id: string; url: string }>;
}

export function runEditArticlePageManager(slug: string) {
  const validation = new ArticleValidation();

  const titleElement = document.getElementById('article-title') as HTMLInputElement;
  const slugElement = document.getElementById('slug-element') as HTMLInputElement;

  slugElement.addEventListener('input', () => {
    slugElement.value = validation.extractSlug(slugElement.value);
  });

  //TITLE
  const onTitleInput = () => {
    const title = titleElement.value;
    if (title.length < 1) {
      slugElement.value = slug;
      return;
    }
    const newSlug = validation.extractSlug(title);
    slugElement.value = newSlug;
  };
  titleElement.addEventListener('input', () => onTitleInput());

  [slugElement, titleElement].forEach((input) =>
    input.addEventListener('blur', async () => {
      const newSlug = slugElement.value;
      if (!newSlug) return slugElement.classList.add('is-danger');
      else slugElement.classList.remove('is-danger');
      if (newSlug === slug) return;
      const response = await fetch('/api/articles/' + newSlug, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 404) return slugElement.classList.remove('is-danger');
      if (response.status === 403) forbidden();
      slugElement.classList.add('is-danger');
      console.log(await response.json());
    })
  );

  //Body
  const article = document.querySelector('#article-content') as HTMLElement;
  // const unsavedImages: UnsavedImages = { blobs: [] };

  const { editor } = TipTapBasedHTMLEditor.initialize(article, uploadBlob, deleteBlob, validation);
  const { toaster, screenProgress } = tools();

  editor.on('update', () => {});

  async function uploadBlob(blob: Blob) {
    const body = new FormData();
    body.set('blob', blob);
    const response = await fetch(`/api/articles/${slug}/blob`, {
      method: 'POST',
      body,
      credentials: 'same-origin',
    });
    if (response.status === 403) {
      forbidden();
      return null;
    }
    if (!response.ok) {
      const { message } = await response.json();
      toaster.danger(message);
      return null;
    }
    const data = await response.json();
    return { url: data.url as string, id: data.id as string };
  }

  async function deleteBlob(nanoId: string) {
    screenProgress.show();
    try {
      const response = await fetch(`/api/articles/${slug}/${nanoId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 403) {
        forbidden();
        return false;
      }
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return false;
      }
      return true;
    } catch (error) {
      toaster.danger();
      console.log(error);
      return false;
    } finally {
      screenProgress.hide();
    }
  }
}
