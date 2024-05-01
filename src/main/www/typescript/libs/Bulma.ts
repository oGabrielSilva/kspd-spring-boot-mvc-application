export const STORAGE_THEME_KEY = '__t';

export function Bulma() {
  const navBurguers = document.querySelectorAll<HTMLButtonElement>('.navbar-burger');

  navBurguers.forEach((el) => {
    el.addEventListener('click', () => {
      const target = document.getElementById(el.dataset.target);
      el.classList.toggle('is-active');
      target.classList.toggle('is-active');
    });
  });

  const themeButtons = document.querySelectorAll<HTMLButtonElement>('.theme-button');

  themeButtons.forEach((button) => {
    button.addEventListener('click', (e) => updateTheme(nextTheme()));
  });

  updateTheme(recoveryTheme());

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach((modal) => {
      hideModal(modal as HTMLElement);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach((trigger) => {
    const modal = trigger.dataset.target;
    const target = document.getElementById(modal);

    trigger.addEventListener('click', () => {
      showModal(target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (
    document.querySelectorAll(
      '.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button'
    ) || []
  ).forEach((close) => {
    const target = close.closest('.modal');

    close.addEventListener('click', () => {
      if (close.dataset.noHide === 'true') return;
      hideModal(target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  });
}

export function nextTheme() {
  const theme = recoveryTheme();
  return theme === 'dark' ? 'light' : 'dark';
}

export function recoveryTheme(): 'dark' | 'light' {
  let defined = document.documentElement.dataset.theme;
  if (!defined) {
    defined = localStorage.getItem(STORAGE_THEME_KEY);
  }
  return ['dark', 'light'].indexOf(defined) > -1
    ? (defined as 'dark')
    : window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function updateTheme(theme: 'dark' | 'light') {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.theme-button');

  buttons.forEach((button) => {
    const icon = button.querySelector('i')!;
    const darkConfig = {
      ic: icon.dataset.icDark,
      htmlClass: icon.dataset.classDark,
    };
    const lightConfig = {
      ic: icon.dataset.icLight,
      htmlClass: icon.dataset.classLight,
    };

    icon.classList.remove(darkConfig.htmlClass);
    icon.classList.remove(darkConfig.ic);
    icon.classList.remove(lightConfig.htmlClass);
    icon.classList.remove(lightConfig.ic);

    if (theme === 'dark') {
      icon.classList.add(darkConfig.htmlClass);
      icon.classList.add(darkConfig.ic);
    } else {
      icon.classList.add(lightConfig.htmlClass);
      icon.classList.add(lightConfig.ic);
    }

    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  });
}

export function showModal(modal: HTMLElement) {
  modal.classList.add('is-active');
}

export function hideModal(modal: HTMLElement) {
  modal.classList.remove('is-active');
}
