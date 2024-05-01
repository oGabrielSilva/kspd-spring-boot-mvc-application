export function forbidden() {
  const popup = window.open(
    '/session?forbidden=true',
    '_blank',
    `width=420,height=580,left=${(window.innerWidth - 420) / 2},top=${
      (window.innerHeight - 580) / 2
    }`
  );

  popup.focus();
}
