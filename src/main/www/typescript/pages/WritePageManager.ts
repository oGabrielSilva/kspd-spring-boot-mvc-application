import { runIsAuthor } from '../modules/article/isAuthor';
import { runIsNonAuthor } from '../modules/article/isNonAuthor';

export function runWritePageManager() {
  const isNonAuthorModal = document.getElementById('confirm-author-modal');
  if (isNonAuthorModal) runIsNonAuthor(isNonAuthorModal);

  const formNewArticle = document.getElementById('new-article') as HTMLFormElement;
  if (formNewArticle) runIsAuthor(formNewArticle);
}
