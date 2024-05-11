import { runIsAuthor } from '../modules/write/isAuthor';
import { runIsNonAuthor } from '../modules/write/isNonAuthor';

export function runWritePageManager() {
  const isNonAuthorModal = document.getElementById('confirm-author-modal');
  if (isNonAuthorModal) runIsNonAuthor(isNonAuthorModal);

  const formNewArticle = document.getElementById('new-article') as HTMLFormElement;
  if (formNewArticle) runIsAuthor(formNewArticle);
}
