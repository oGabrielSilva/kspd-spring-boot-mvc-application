import { showModal } from '../libs/Bulma';
import { ScreenProgressTool } from '../tools/ScreenProgressTool';
import { ToasterTool } from '../tools/ToasterTool';
import { AuthenticationValidation } from '../validations/AuthenticationValidation';

export function runSessionPageManager() {
  const isForbidden = window.location.search.split('forbidden=true').length > 1;
  const validation = new AuthenticationValidation();
  const toaster = ToasterTool.get();
  const anim = toaster.animator;
  const progress = ScreenProgressTool.get();

  const termsModal = document.getElementById('terms-modal') as HTMLElement;

  const form = document.querySelector<HTMLFormElement>('#form-session')!;
  const signUpButton = form.querySelector<HTMLButtonElement>('button.sign-up');

  const emailInput = form.querySelector<HTMLInputElement>('#input-email');
  const emailHelper = form.querySelector<HTMLElement>('#email-helper');

  const passwordInput = form.querySelector<HTMLInputElement>('#input-password');
  const passwordHelper = form.querySelector<HTMLElement>('#password-helper');

  emailInput.addEventListener('input', emailUpdateState);

  function emailUpdateState() {
    if (validation.isEmailValid(emailInput.value)) {
      emailInput.classList.remove('is-danger');
      emailHelper.style.visibility = 'hidden';
      return;
    }
    emailInput.classList.add('is-danger');
    emailHelper.style.visibility = '';
  }

  passwordInput.addEventListener('input', passwordUpdateState);

  function passwordUpdateState() {
    if (validation.isPasswordValid(passwordInput.value)) {
      passwordInput.classList.remove('is-danger');
      passwordHelper.style.visibility = 'hidden';
      return;
    }
    passwordInput.classList.add('is-danger');
    passwordHelper.style.visibility = '';
  }

  function validateForm() {
    const email = emailInput.value;
    if (!validation.isEmailValid(email)) {
      toaster.alert(emailHelper.textContent);
      anim.shake(emailInput.parentElement.querySelector('i'));
      anim.shake(emailInput);
      emailUpdateState();
      return null;
    }

    const password = passwordInput.value;
    if (!validation.isPasswordValid(password)) {
      toaster.alert(passwordHelper.textContent);
      anim.shake(passwordInput.parentElement.querySelector('i'));
      anim.shake(passwordInput);
      passwordUpdateState();
      return null;
    }
    return { email, password, cookie: true };
  }

  signUpButton.addEventListener('click', (e) => {
    e.preventDefault();
    const payload = validateForm();
    if (payload === null) return;
    showModal(termsModal);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = validateForm();
    if (!payload) return;
    submitPayload(JSON.stringify(payload));
  });

  async function submitPayload(payload: string, signUp = false) {
    progress.show();
    try {
      const response = await fetch(signUp ? '/api/session/sign-up' : '/api/session', {
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return;
      }
      return isForbidden ? window.close() : (window.location.href = getNextHref());
    } catch (error) {
      console.log(error);
    } finally {
      progress.hide();
    }
  }

  termsModal.querySelector('button.is-success').addEventListener('click', () => onTermsSucces());

  function onTermsSucces() {
    const payload = validateForm();
    submitPayload(JSON.stringify(payload), true);
  }
}

function getNextHref() {
  const params = window.location.search.replace('?', '').split('&');
  const next = params.find((p) => p.startsWith('next'));
  return next.length > 0 ? next.split('=')[1] : '/';
}
