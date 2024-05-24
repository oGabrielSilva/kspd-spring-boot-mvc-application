export function popup(uri: string) {
  return window.open(
    uri,
    '_blank',
    `width=420,height=580,left=${(window.innerWidth - 420) / 2},top=${
      (window.innerHeight - 580) / 2
    }`
  );
}
