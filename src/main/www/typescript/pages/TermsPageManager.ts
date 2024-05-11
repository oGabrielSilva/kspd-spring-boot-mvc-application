export function runTermsPageManager() {
  const tabs = document.querySelectorAll<HTMLElement>('.user-term-tab');
  const tabControls: Array<HTMLElement> = [];

  tabs.forEach((tab) => {
    const control = document.getElementById(tab.dataset.controls);
    tabControls.push(control);

    tab.addEventListener('click', () => {
      tabs.forEach((t, i) => {
        t.classList.remove('is-active');
        tabControls[i].classList.add('is-hidden');
        tabControls[i].classList.remove('is-flex');
      });
      tab.classList.add('is-active');
      control.classList.remove('is-hidden');
      control.classList.add('is-flex');
    });
  });

  byHash(tabs);

  window.addEventListener('hashchange', () => byHash(tabs));
}

function byHash(tabs: NodeListOf<HTMLElement>) {
  const hash = location.hash.replace('#', '');
  console.log(hash);
  if (hash === 'author' || hash === 'autor') {
    const tab = Array.from(tabs).find((t) => t.dataset.controls === 'author');
    if (tab) tab.click();
    return;
  }
  if (hash === 'common' || hash === 'user') {
    const tab = Array.from(tabs).find((t) => t.dataset.controls === 'common');
    if (tab) tab.click();
  }
}
