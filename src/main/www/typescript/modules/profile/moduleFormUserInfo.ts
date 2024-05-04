import { hideModal, showModal } from '../../libs/Bulma';
import { ImageProcessingTool } from '../../tools/ImageProcessingTool';
import { ScreenProgressTool } from '../../tools/ScreenProgressTool';
import { ToasterTool } from '../../tools/ToasterTool';
import { forbidden } from '../../utilities/forbidden';
import { AuthenticationValidation } from '../../validations/AuthenticationValidation';

const localStorageId = '__id@toaster-key';

export function runModuleFormUserInfo() {
  const imageTool = ImageProcessingTool.get();
  const toaster = ToasterTool.get();
  const anim = toaster.animator;
  const progress = ScreenProgressTool.get();

  const message = localStorage.getItem(localStorageId);
  if (message) {
    toaster.success(message);
    localStorage.removeItem(localStorageId);
  }

  const validation = new AuthenticationValidation();

  const form = document.getElementById('profile-part') as HTMLFormElement;
  const avatarInput = form.querySelector('#input-avatar') as HTMLInputElement;
  const avatarPreview = form.querySelector('#avatar-preview') as HTMLImageElement;
  let avatar: Blob = null;
  const emailInput = form.querySelector<HTMLInputElement>('#input-email');
  const emailOriginal = emailInput.dataset.original ?? '';
  const emailHelper = form.querySelector<HTMLParagraphElement>('#email-helper');
  const nameInput = form.querySelector<HTMLInputElement>('#input-name');
  const nameOriginal = nameInput.dataset.original ?? '';
  const nameHelper = form.querySelector<HTMLParagraphElement>('#name-helper');
  const usernameInput = form.querySelector<HTMLInputElement>('#input-username');
  const usernameOriginal = usernameInput.dataset.original ?? '';
  const bioInput = form.querySelector<HTMLTextAreaElement>('#input-bio');
  const bioOriginal = bioInput.dataset.original ?? '';

  const emailModal = document.getElementById('confirm-email-modal');
  const passwordConfirmInput = emailModal.querySelector('input') as HTMLInputElement;
  const passwordConfirmInputHelper = emailModal.querySelector('#password-helper') as HTMLElement;

  function formImageModule() {
    const err = avatarInput.dataset.error;

    avatarInput.addEventListener('input', async () => {
      const file = avatarInput.files && avatarInput.files[0] ? avatarInput.files[0] : null;
      if (!file) return;
      progress.show();
      let hideProgressHere = true;
      try {
        avatar = await imageTool.fileToBlobWebpWithoutResize(file, 0);
        if (!avatar) {
          toaster.danger(err);
          return;
        }
        hideProgressHere = false;
        submitAvatar();
      } catch (error) {
        console.log(error);
        toaster.danger();
      } finally {
        if (hideProgressHere) progress.hide();
      }
    });
    avatarPreview.addEventListener('click', () => avatarInput.click());
  }

  async function submitAvatar() {
    try {
      const payload = new FormData();
      console.log(avatar);
      payload.set('avatar', avatar);
      const response = await fetch('/api/user/avatar', {
        method: 'PATCH',
        credentials: 'same-origin',
        body: payload,
      });
      if (response.status === 403) return forbidden();
      console.log(response);
      console.log(await response.json());
      const uri = URL.createObjectURL(avatar);
      URL.revokeObjectURL(avatarPreview.src);
      avatarPreview.src = uri;
    } catch (error) {
      console.log(error);
    } finally {
      progress.hide();
    }
  }

  formImageModule();

  emailInput.addEventListener('input', () => {
    if (validation.isEmailValid(emailInput.value)) {
      emailHelper.classList.add('is-hidden');
      emailInput.classList.remove('is-danger');
      return;
    }
    emailHelper.classList.remove('is-hidden');
    emailInput.classList.add('is-danger');
  });

  nameInput.addEventListener('input', () => {
    if (validation.isNameValid(nameInput.value)) {
      nameHelper.classList.add('is-hidden');
      nameInput.classList.remove('is-danger');
      return;
    }
    nameHelper.classList.remove('is-hidden');
    nameInput.classList.add('is-danger');
  });

  usernameInput.addEventListener('input', () => {
    usernameInput.value = validation.normalizeUsername(usernameInput.value);
    if (validation.isUsernameValid(usernameInput.value)) {
      usernameInput.classList.remove('is-danger');
      return;
    }
    usernameInput.classList.add('is-danger');
  });

  passwordConfirmInput.addEventListener('input', () => {
    if (validation.isPasswordValid(passwordConfirmInput.value)) {
      passwordConfirmInput.classList.remove('is-danger');
      passwordConfirmInputHelper.classList.add('is-hidden');
      return;
    }
    passwordConfirmInput.classList.add('is-danger');
    passwordConfirmInputHelper.classList.remove('is-hidden');
  });

  const onConfirmModal = () => {
    if (!validation.isPasswordValid(passwordConfirmInput.value)) {
      toaster.alert(passwordConfirmInputHelper.textContent);
      anim.shake(passwordConfirmInput);
      return;
    }
    trySubmit({ password: passwordConfirmInput.value });
  };

  emailModal.addEventListener('submit', (e) => {
    e.preventDefault();
    onConfirmModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    trySubmit();
  });

  function trySubmit(confirmedEmail: { password: string } = null) {
    const payload: User = {} as User;

    if (!confirmedEmail && emailInput.value !== emailOriginal) {
      if (!validation.isEmailValid(emailInput.value)) {
        toaster.alert(emailHelper.textContent);
        anim.shake(emailInput);
        return;
      }
      showModal(emailModal);
      passwordConfirmInput.focus();
      return;
    }

    if (confirmedEmail !== null && !!confirmedEmail.password) {
      (payload as any).password = confirmedEmail.password;
      payload.email = emailInput.value;
    }

    if (nameInput.value !== nameOriginal) {
      if (!validation.isNameValid(nameInput.name)) {
        toaster.alert(nameHelper.textContent);
        anim.shake(nameInput);
        return;
      }
      payload.name = nameInput.value;
    }

    if (usernameInput.value !== usernameOriginal) {
      payload.username = usernameInput.value;
      if (!validation.isUsernameValid(payload.username)) {
        toaster.alert(usernameInput.dataset.error);
        anim.shake(usernameInput);
        return;
      }
    }

    if (bioInput.value && bioInput.value !== bioOriginal) {
      payload.bio = bioInput.value;
    }

    submitPayload(payload, form.dataset.message, toaster, progress);
  }

  execChangePassword(validation, toaster, progress);
}

async function submitPayload(
  payload: User,
  successMessage: string,
  toaster: ToasterTool,
  screenProgressTool: ScreenProgressTool
) {
  screenProgressTool.show();
  console.log(payload);
  try {
    const response = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
    });
    if (response.status === 403) return forbidden();
    if (!response.ok) {
      const { message } = await response.json();
      toaster.danger(message);
      return;
    }
    localStorage.setItem(localStorageId, successMessage);
    if (!!payload.username) window.location.href = '/u/' + payload.username;
    else window.location.reload();
  } catch (error) {
    console.log(error);
    toaster.danger();
  } finally {
    screenProgressTool.hide();
  }
}

async function execChangePassword(
  validation: AuthenticationValidation,
  toaster: ToasterTool,
  progress: ScreenProgressTool
) {
  const anim = toaster.animator;

  const buttonChangePassword = document.getElementById(
    'button-change-password'
  ) as HTMLButtonElement;
  const passwordModal = document.getElementById('change-password-modal');

  const passwordInput = passwordModal.querySelector<HTMLInputElement>('#input-current-password');
  const passwordInputHelper = passwordModal.querySelector('#current-password-helper');
  const passwordInputNew = passwordModal.querySelector<HTMLInputElement>('#input-new-password');
  const passwordInputNewHelper = passwordModal.querySelector('#new-password-helper');
  const passwordInputNewConfirm = passwordModal.querySelector<HTMLInputElement>(
    '#input-confirm-new-password'
  );
  const passwordInputNewConfirmHelper = passwordModal.querySelector('#confirm-new-password-helper');

  passwordInput.addEventListener('input', () => {
    if (validation.isPasswordValid(passwordInput.value)) {
      passwordInput.classList.remove('is-danger');
      passwordInputHelper.classList.add('is-hidden');
      return;
    }
    passwordInput.classList.add('is-danger');
    passwordInputHelper.classList.remove('is-hidden');
  });

  const validateNewPassword = () => {
    const isNewPasswordValid = validation.isPasswordValid(passwordInputNew.value);
    if (isNewPasswordValid) {
      passwordInputNew.classList.remove('is-danger');
      passwordInputNewHelper.classList.add('is-hidden');
    } else {
      passwordInputNew.classList.add('is-danger');
      passwordInputNewHelper.classList.remove('is-hidden');
    }
    if (!isNewPasswordValid) return;
    if (
      validation.isPasswordValid(passwordInputNewConfirm.value) &&
      passwordInputNew.value === passwordInputNewConfirm.value
    ) {
      passwordInputNewConfirm.classList.remove('is-danger');
      passwordInputNewConfirmHelper.classList.add('is-hidden');
      return;
    }
    passwordInputNewConfirm.classList.add('is-danger');
    passwordInputNewConfirmHelper.classList.remove('is-hidden');
  };

  passwordInputNew.addEventListener('input', validateNewPassword);

  passwordInputNewConfirm.addEventListener('input', validateNewPassword);

  buttonChangePassword.addEventListener('click', () => {
    showModal(passwordModal);
    passwordInput.focus();
  });

  passwordModal.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validation.isPasswordValid(passwordInput.value)) {
      toaster.alert(passwordInputHelper.textContent);
      anim.shake(passwordInput);
      return;
    }
    if (!validation.isPasswordValid(passwordInputNew.value)) {
      toaster.alert(passwordInputNewHelper.textContent);
      anim.shake(passwordInputNew);
      return;
    }
    if (!validation.isPasswordValid(passwordInputNewConfirm.value)) {
      toaster.alert(passwordInputNewConfirmHelper.textContent);
      anim.shake(passwordInputNewConfirm);
      return;
    }
    if (passwordInputNew.value !== passwordInputNewConfirm.value) {
      toaster.alert(passwordInputNewConfirmHelper.textContent);
      anim.shake(passwordInputNew);
      anim.shake(passwordInputNewConfirm);
      return;
    }
    if (passwordInputNew.value === passwordInput.value) {
      toaster.alert(passwordInput.dataset.errorEqual);
      anim.shake(passwordInput);
      anim.shake(passwordInputNew);
      anim.shake(passwordInputNewConfirm);
      return;
    }
    progress.show();
    try {
      const payload = JSON.stringify({
        password: passwordInput.value,
        newPassword: passwordInputNew.value,
      });
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        credentials: 'same-origin',
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = (await response.json()) as RestException;
        toaster.danger(message ? message : void 0);
        return;
      }
      toaster.success(passwordModal.dataset.message);
      passwordInput.value = '';
      passwordInputNew.value = '';
      passwordInputNewConfirm.value = '';

      hideModal(passwordModal);
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      progress.hide();
    }
  });
}
