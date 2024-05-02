import { tools } from '../../utilities/tools';

export function runModuleFormUserSocial() {
  const { toaster } = tools();

  const form = document.getElementById('social-part') as HTMLFormElement;
  const xInput = form.querySelector<HTMLInputElement>('#input-x');
  const youtubeInput = form.querySelector<HTMLInputElement>('#input-youtube');
  const instagramInput = form.querySelector<HTMLInputElement>('#input-instagram');
  const linkedinInput = form.querySelector<HTMLInputElement>('#input-linkedin');
  const githubInput = form.querySelector<HTMLInputElement>('#input-github');
  const siteInput = form.querySelector<HTMLInputElement>('#input-site');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      ...(xInput.value !== (xInput.dataset.original || '') ? { x: xInput.value } : {}),
      ...(youtubeInput.value !== (youtubeInput.dataset.original || '')
        ? { youtube: youtubeInput.value }
        : {}),
      ...(instagramInput.value !== (instagramInput.dataset.original || '')
        ? { instagram: instagramInput.value }
        : {}),
      ...(linkedinInput.value !== (linkedinInput.dataset.original || '')
        ? { linkedin: linkedinInput.value }
        : {}),
      ...(githubInput.value !== (githubInput.dataset.original || '')
        ? { github: githubInput.value }
        : {}),
      ...(siteInput.value !== (siteInput.dataset.original || '') ? { site: siteInput.value } : {}),
    } as Social;

    if (Object.keys(payload).length < 1) return toaster.info(form.dataset.neutral);

    const response = await fetch('/api/user/social', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log(response);
  });
}
