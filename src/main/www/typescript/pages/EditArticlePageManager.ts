import { ArticleValidation } from '../validations/ArticleValidation';
import { forbidden } from '../utilities/forbidden';

import { editor } from '../modules/write/Editor';

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

  editor(validation);
}
