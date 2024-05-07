export function runTermsPageManager() {
  const tabs = document.querySelectorAll<HTMLElement>('.user-term-tab');
  const tabControls: Array<HTMLElement> = [];

  console.log(tabs);

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
}
