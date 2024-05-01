import { runModuleFormUserInfo } from '../modules/profile/moduleFormUserInfo';
import { runModuleFormUserSocial } from '../modules/profile/moduleFormUserSocial';

interface FormProps {
  form: HTMLFormElement;
  container: HTMLElement;
  link: HTMLAnchorElement;
}

export function runProfileEditPageManager() {
  const tabs = document.querySelectorAll<HTMLAnchorElement>('a.tab-show-form');
  const forms = [] as Array<FormProps>;

  tabs.forEach((tab) => {
    const form = document.getElementById(tab.dataset.controls) as HTMLFormElement;
    const listItem = tab.parentElement;
    forms.push({ form, container: listItem, link: tab });

    tab.addEventListener('click', () => {
      forms.forEach(({ form: f, container: c }) => {
        f.classList.add('is-hidden');
        c.classList.remove('is-active');
      });
      form.classList.remove('is-hidden');
      listItem.classList.add('is-active');
    });
  });

  if (location.hash.length > 1) {
    const hash = location.hash.replace('#', '');
    forms.find((opt) => opt.link.href.split('#')[1] === hash)?.link.click();
  }

  runModuleFormUserInfo();
  runModuleFormUserSocial();
}
