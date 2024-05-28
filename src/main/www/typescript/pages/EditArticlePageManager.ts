import { ArticleValidation } from '../validations/ArticleValidation';
import { forbidden } from '../utilities/forbidden';
import { TipTapBasedHTMLEditor } from '../modules/article/TipTapBasedHTMLEditor';
import { saveEditorChanges } from '../modules/article/saveEditorChanges';

export function runEditArticlePageManager(slug: string) {
  const validation = new ArticleValidation();
  const headTitle = document.head.querySelector('title');

  const titleElement = document.getElementById('article-title') as HTMLInputElement;
  const slugElement = document.getElementById('slug-element') as HTMLInputElement;

  slugElement.addEventListener('input', () => {
    slugElement.value = validation.extractSlug(slugElement.value);
  });

  //TITLE
  const titlePrefix = ' - ' + headTitle.textContent.split('-')[1];
  const onTitleInput = () => {
    const title = titleElement.value;
    headTitle.textContent = title + titlePrefix;
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
      const response = await fetch('/api/article/' + newSlug, {
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

  TipTapBasedHTMLEditor.slug = slug;
  const { editor } = TipTapBasedHTMLEditor.initialize(article, validation);

  window.addEventListener('keydown', (e) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveEditorChanges(editor, titleElement, slugElement, slug);
    }
  });

  window.onbeforeunload = (e) => {
    e.preventDefault();
    return (e.returnValue = true);
  };
}
