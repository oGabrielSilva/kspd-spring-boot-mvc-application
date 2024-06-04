import '../css/global.css';
import { Bulma } from './libs/Bulma';
import { runAccountVerificationManager } from './pages/AccountVerificationManager';
import { ArticlePageManager } from './pages/ArticlePageManager';
import { ContactPageManager } from './pages/ContactPageManager';
import { runEditArticleMetadataPageManager } from './pages/EditArticleMetadataPageManager';
import { runEditArticlePageManager } from './pages/EditArticlePageManager';
import { runIndexPageManager } from './pages/IndexPageManager';
import { runProfileEditPageManager } from './pages/ProfileEditPageManager';
import { runSessionPageManager } from './pages/SessionPageManager';
import { StacksPageManager } from './pages/StacksPageManager';
import { runTermsPageManager } from './pages/TermsPageManager';
import { UniqueStackPageManager } from './pages/UniqueStackPageManager';
import { runWritePageManager } from './pages/WritePageManager';
import { formatTime } from './utilities/formatTime';

(() => {
  Bulma();

  window.wwwrootPageManager = document.getElementById(
    'wwwroot-page-manager-id'
  ) as HTMLInputElement;

  if (!window.wwwrootPageManager) return console.error('WWWROOT manager id not found');

  const path = window.wwwrootPageManager.value ?? '';
  const slug = window.wwwrootPageManager.dataset.slug;
  const isMod = window.wwwrootPageManager.dataset.isMod === 'true';
  const pageManager = (
    {
      '': () => {},
      '/index': runIndexPageManager,
      '/session': runSessionPageManager,
      '/profile-edit': runProfileEditPageManager,
      '/account-verification': runAccountVerificationManager,
      '/terms': runTermsPageManager,
      '/write': runWritePageManager,
      '/article': () => ArticlePageManager.instance.run(),
      '/article/edit': () => runEditArticlePageManager(slug),
      '/article/edit/metadata': () => runEditArticleMetadataPageManager(slug),
      '/stack': () => UniqueStackPageManager.instance.run(),
      '/stacks': () => StacksPageManager.instance.run(isMod),
      '/contact': () => ContactPageManager.instance.run(),
      '/report': () => ContactPageManager.instance.run(),
      '/master': () => {},
    } as { [key: string]: () => void }
  )[path];

  pageManager ? pageManager() : void 0;

  document.querySelectorAll('[data-format-time]')?.forEach(formatTime);
})();
