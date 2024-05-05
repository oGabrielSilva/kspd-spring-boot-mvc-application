export function runIndexPageManager() {
  const avatarImageLink = document.getElementById('nav-user-ic');
  const profileLink = document.getElementById('nav-user-profile-link');

  avatarImageLink.addEventListener('click', () => profileLink.click());
}
