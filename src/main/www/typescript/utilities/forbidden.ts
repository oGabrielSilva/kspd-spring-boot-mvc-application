import { popup } from './popup';

export function forbidden() {
  const forbiddenPopup = popup('/session?forbidden=true');

  forbiddenPopup.focus();
}
