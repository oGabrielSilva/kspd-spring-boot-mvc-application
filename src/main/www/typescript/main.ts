import '../css/global.css';
import { Bulma } from './libs/Bulma';
import { runAccountVerificationManager } from './pages/AccountVerificationManager';
import { ArticlePageManager } from './pages/ArticlePageManager';
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

  const wwwrootPageManager = document.getElementById('wwwroot-page-manager-id') as HTMLInputElement;

  if (!wwwrootPageManager) return console.error('WWWROOT manager id not found');

  switch (wwwrootPageManager.value ?? '') {
    case '':
      break;
    case '/index':
      runIndexPageManager();
      break;
    case '/session':
      runSessionPageManager();
      break;
    case '/profile-edit':
      runProfileEditPageManager();
      break;
    case '/account-verification':
      runAccountVerificationManager();
      break;
    case '/terms':
      runTermsPageManager();
      break;
    case '/write':
      runWritePageManager();
      break;
    case '/article':
      ArticlePageManager.instance.run();
      break;
    case '/article/edit':
      runEditArticlePageManager(wwwrootPageManager.dataset.slug);
      break;
    case '/article/edit/metadata':
      runEditArticleMetadataPageManager(wwwrootPageManager.dataset.slug);
      break;
    case '/stack':
      UniqueStackPageManager.instance.run();
      break;
    case '/stacks':
      StacksPageManager.instance.run(wwwrootPageManager.dataset.isMod === 'true');
      break;
  }
  document.querySelectorAll('[data-format-time]')?.forEach(formatTime);
})();
