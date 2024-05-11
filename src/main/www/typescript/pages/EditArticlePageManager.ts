import { ArticleValidation } from '../validations/ArticleValidation';

export function runEditArticlePageManager(slug: string) {
  const validation = new ArticleValidation();

  const titleElement = document.getElementById('article-title') as HTMLInputElement;
  const slugElement = document.getElementById('slug-element');
  const contentElement = document.getElementById('article-content');

  //TITLE
  const onTitleInput = () => {
    const title = titleElement.value;
    if (title.length < 1) slugElement.textContent = slug;
    else slugElement.textContent = validation.extractSlug(title);
  };
  titleElement.addEventListener('input', () => onTitleInput());

  // titleElement.addEventListener('paste', (e) => {
  //   e.preventDefault();
  //   var text = e.clipboardData.getData('text/plain').trim();
  //   const selection = window.getSelection();
  //   if (selection && selection.rangeCount > 0) {
  //     const range = selection.getRangeAt(0);
  //     const span = document.createElement('span');
  //     span.textContent = text;
  //     range.insertNode(span);
  //     selection.collapseToEnd();
  //     onTitleInput();
  //   }
  // });

  //CONTENT
  // const menu = document.getElementById('menu');

  // const posMenu = () => {
  //   const selection = window.getSelection();
  //   const range = selection.getRangeAt(0);
  //   let rect = range.getBoundingClientRect();
  //   if (rect.x === 0 && rect.y === 0) {
  //     rect = contentElement.getBoundingClientRect();
  //   }

  //   let top = rect.top - menu.offsetHeight - 40;
  //   top = Math.max(0, top);

  //   let left = rect.left + rect.width / 2 - menu.offsetWidth / 2;
  //   left = Math.max(0, Math.min(left, window.innerWidth - menu.offsetWidth));

  //   menu.style.top = top + 'px';
  //   menu.style.left = left + 'px';
  // };

  // const onContentInput = () => {
  //   posMenu();
  // };
  // contentElement.addEventListener('input', () => onContentInput());

  // contentElement.addEventListener('click', () => {
  //   menu.classList.remove('is-hidden');
  //   posMenu();
  // });

  // document.addEventListener('click', (e) => {
  //   if (
  //     e.target instanceof HTMLElement &&
  //     (e.target.dataset.noHideMenu === 'true' ||
  //       e.target.id === contentElement.id ||
  //       contentElement.contains(e.target))
  //   )
  //     return;
  //   menu.classList.add('is-hidden');
  // });

  // const bold = menu.querySelector('button[data-action="bold"]') as HTMLButtonElement;

  // bold.onclick = () => {};
}
