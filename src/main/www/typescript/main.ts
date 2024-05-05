import '../css/global.css';
import { Bulma } from './libs/Bulma';
import { runIndexPageManager } from './pages/IndexPageManager';
import { runProfileEditPageManager } from './pages/ProfileEditPageManager';
import { runSessionPageManager } from './pages/SessionPageManager';

(() => {
  const wwwrootPageManager = document.getElementById('wwwroot-page-manager-id') as HTMLInputElement;

  if (!wwwrootPageManager) console.error('WWWROOT manager id not found');

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
  }

  Bulma();
})();
