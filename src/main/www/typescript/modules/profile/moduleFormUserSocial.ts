import { forbidden } from '../../utilities/forbidden';
import { tools } from '../../utilities/tools';

export function runModuleFormUserSocial() {
  const { toaster, screenProgress: progress } = tools();

  const form = document.getElementById('social-part') as HTMLFormElement;
  const xInput = form.querySelector<HTMLInputElement>('#input-x');
  const youtubeInput = form.querySelector<HTMLInputElement>('#input-youtube');
  const instagramInput = form.querySelector<HTMLInputElement>('#input-instagram');
  const linkedinInput = form.querySelector<HTMLInputElement>('#input-linkedin');
  const githubInput = form.querySelector<HTMLInputElement>('#input-github');
  const redditInput = form.querySelector<HTMLInputElement>('#input-reddit');
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
      ...(redditInput.value !== (redditInput.dataset.original || '')
        ? { reddit: redditInput.value }
        : {}),
      ...(siteInput.value !== (siteInput.dataset.original || '') ? { site: siteInput.value } : {}),
    } as Social;
    console.log(payload);
    if (Object.keys(payload).length < 1) return toaster.info(form.dataset.neutral);
    progress.show();
    try {
      const response = await fetch('/api/user/social', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return;
      }
      toaster.success(form.dataset.message);
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      progress.hide();
    }
  });
}
