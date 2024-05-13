import Quill from 'quill';

import { ArticleValidation } from '../validations/ArticleValidation';
import { ImageProcessingTool } from '../tools/ImageProcessingTool';
import { forbidden } from '../utilities/forbidden';
import { ImageBlot, quillConfiguration } from '../modules/write/Quill';
import { showModal } from '../libs/Bulma';

export function runEditArticlePageManager(slug: string) {
  const imageProcessor = ImageProcessingTool.get();
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

  //Quill

  const article = document.querySelector('#article-content') as HTMLElement;
  const figureModal = document.getElementById('figure-modal');

  const editor = new Quill(
    article,
    quillConfiguration(imageProcessor, article.dataset.placeholder)
  );
  ImageBlot.editor = editor;
  ImageBlot.blotName = 'image';
  ImageBlot.tagName = 'img';
  // Quill.register(ImageBlot);

  ImageBlot.onFigureClick = (img, figcaption, figure) => {
    if (figure.dataset.img !== img.id) {
      const figureFigcaption = figureModal.querySelector('#figure-figcaption') as HTMLInputElement;
      const figureTitle = figureModal.querySelector('#figure-title') as HTMLInputElement;
      const figureAlt = figureModal.querySelector('#figure-alt') as HTMLInputElement;
      const figureLoading = figureModal.querySelector('#figure-loading') as HTMLSelectElement;

      figureFigcaption.value = figcaption.innerText;
      figureTitle.value = img.title;
      figureAlt.value = img.alt;
      figureLoading.value = img.loading;

      figureFigcaption.oninput = () => (figcaption.textContent = figureFigcaption.value);
      figureTitle.oninput = () => (img.title = figureTitle.value);
      figureAlt.oninput = () => (img.alt = figureAlt.value);
      figureLoading.onchange = () => {
        if (figureLoading.value === 'eager' || figureLoading.value === 'lazy')
          img.loading = figureLoading.value;
      };

      figure.dataset.img = img.id;
    }

    showModal(figureModal);
  };

  // editor.root.innerHTML = article.dataset.content;

  // editor.root.querySelectorAll('figure')?.forEach((figure) => {
  //   const img = figure.querySelector('img');
  //   const figcaption = figure.querySelector('figcaption');
  //   if (img && figcaption) ImageBlot.configureFigure(figure, img, figcaption);
  // });

  (window as any).editor = editor;
}
