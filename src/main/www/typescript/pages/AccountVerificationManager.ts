import { forbidden } from '../utilities/forbidden';
import { tools } from '../utilities/tools';

export function runAccountVerificationManager() {
  const { toaster, anim, screenProgress } = tools();

  const form = document.querySelector('form');
  const codeInput = form.querySelector('input');

  codeInput.addEventListener(
    'input',
    () => (codeInput.value = codeInput.value.toLocaleUpperCase())
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = codeInput.value;

    if (!code || code.length !== 5) {
      toaster.alert(codeInput.dataset.messageLen);
      anim.shake(codeInput);
      return;
    }

    const payload = { validation: code };
    screenProgress.show();
    try {
      const response = await fetch('/api/user/email-validation', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(response);
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return;
      }
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  });
}
