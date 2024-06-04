import { AnimationTool } from '../tools/AnimationTool';
import { ImageProcessingTool } from '../tools/ImageProcessingTool';
import { ScreenProgressTool } from '../tools/ScreenProgressTool';
import { ToasterTool } from '../tools/ToasterTool';
import { forbidden } from '../utilities/forbidden';
import { generateHTML } from '../utilities/generateHtml';
import { ContactValidation } from '../validations/ContactValidation';

export class ContactPageManager {
  private readonly valdiation = new ContactValidation();
  private readonly imageTool = ImageProcessingTool.get();
  private readonly animator = AnimationTool.get();
  private readonly toaster = ToasterTool.get();
  private readonly screen = ScreenProgressTool.get();

  private readonly form = document.getElementById('submit-contact');
  private readonly successMessage = this.form.dataset.message;
  private readonly isReport = wwwrootPageManager.value === '/report';

  private readonly nameInput = this.form.querySelector<HTMLInputElement>('#name');
  private readonly surnameInput = this.form.querySelector<HTMLInputElement>('#surname');
  private readonly emailInput = this.form.querySelector<HTMLInputElement>('#email');
  private readonly messageInput = this.form.querySelector<HTMLTextAreaElement>('#message');
  private readonly messageHelper = this.form.querySelector<HTMLTextAreaElement>('#text-helper');
  private readonly fileInputContainer = this.form.querySelector('[data-file-container]');
  private readonly fileInput = this.fileInputContainer.querySelector<HTMLInputElement>('#file');
  private readonly fileInputHelper =
    this.fileInputContainer.querySelector<HTMLElement>('.file-name');
  private readonly fileInputHelperMaxLen =
    this.form.querySelector<HTMLElement>('[data-file-max-len]');

  private readonly subjectInput = this.form.querySelector<HTMLInputElement>('#subject');

  private readonly countrySelect = this.form.querySelector<HTMLSelectElement>('select#country');

  private file: Blob | File = null;

  private async configureOptionCountries() {
    const request = await fetch('/public/json/countries.json', { method: 'GET' });
    if (request.ok) {
      const countries = (await request.json()) as Array<Country>;
      countries.forEach((country) => {
        const opt = generateHTML({
          htmlType: 'option',
          attributes: [{ key: 'value', value: country.code }],
          value: country.name,
        }) as HTMLOptionElement;
        if (country.code === 'BR') opt.selected = true;
        this.countrySelect.appendChild(opt);
      });
    }
  }

  private updateMessageHelper() {
    this.messageHelper.textContent = String(
      ContactValidation.messageMaxLen - this.messageInput.value.trim().length
    );
  }

  private updateFileHelper(content: string) {
    this.fileInputHelper.textContent = content;

    if (this.fileInputHelper.classList.contains('is-hidden'))
      this.fileInputHelper.classList.remove('is-hidden');

    if (!this.fileInputContainer.classList.contains('has-name'))
      this.fileInputContainer.classList.add('has-name');

    if (this.valdiation.isFileValid(this.file.size))
      this.fileInputHelperMaxLen.classList.add('is-hidden');
    else this.fileInputHelperMaxLen.classList.remove('is-hidden');
  }

  private listenName() {
    this.nameInput.addEventListener('input', () => {
      if (this.valdiation.isNameValid(this.nameInput.value))
        this.nameInput.classList.remove('is-danger');
      else this.nameInput.classList.add('is-danger');
    });
  }

  private listenEmail() {
    this.emailInput.addEventListener('input', () => {
      if (this.valdiation.isEmailValid(this.emailInput.value))
        this.emailInput.classList.remove('is-danger');
      else this.emailInput.classList.add('is-danger');
    });
  }

  private listenSubject() {
    this.subjectInput.addEventListener('input', () => {
      if (this.valdiation.isSubjectValid(this.subjectInput.value))
        this.subjectInput.classList.remove('is-danger');
      else this.subjectInput.classList.add('is-danger');
    });
  }

  private listenMessage() {
    this.messageInput.addEventListener('input', () => {
      if (this.valdiation.isMessageValid(this.messageInput.value))
        this.messageInput.classList.remove('is-danger');
      else this.messageInput.classList.add('is-danger');

      this.updateMessageHelper();
    });
  }

  private listenFile() {
    this.fileInput.addEventListener('input', async () => {
      if (this.fileInput.files && this.fileInput.files[0]) {
        const file = this.fileInput.files[0];
        this.file = file.type.includes('image')
          ? await this.imageTool.imageToBlobJpegWhithoutResize(file)
          : (this.file = file);

        this.updateFileHelper(file.name);
      }
    });
  }

  private listenForm() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = this.nameInput.value.trim();
      if (!this.valdiation.isNameValid(name))
        return this.animator.shakeAll(
          [this.nameInput, this.nameInput.parentNode.querySelector('span')],
          this.nameInput
        );

      const email = this.emailInput.value.trim();
      if (!this.valdiation.isEmailValid(email))
        return this.animator.shakeAll(
          [this.emailInput, this.emailInput.parentNode.querySelector('span')],
          this.emailInput
        );

      const subject = this.subjectInput.value.trim();
      if (!this.valdiation.isSubjectValid(subject)) return this.animator.shake(this.subjectInput);

      const message = this.messageInput.value.trim();
      if (!this.valdiation.isMessageValid(message)) return this.animator.shake(this.messageInput);

      if (this.file && !this.valdiation.isFileValid(this.file.size))
        return this.animator.shake(this.form.querySelector('.has-name'));

      const surname = this.surnameInput.value.trim();
      const file = this.file;
      const country = this.countrySelect.value;

      this.screen.show();
      try {
        const body = new FormData();
        body.set('name', name);
        body.set('surname', surname);
        body.set('email', email);
        body.set('subject', subject);
        body.set('message', message);
        body.set('file', file);
        body.set('country', country);
        body.set('isReport', String(this.isReport));

        const request = await fetch('/api/contact', {
          body,
          method: 'POST',
          credentials: 'include',
        });

        if (request.status === 403) return forbidden();
        if (!request.ok) {
          const { message } = await request.json();
          return this.toaster.danger(message);
        }

        this.toaster.success(this.successMessage);
      } catch (error) {
        console.log(error);
        this.toaster.danger();
      } finally {
        this.screen.hide();
      }
    });
  }

  private listen() {
    this.listenName();
    this.listenEmail();
    this.listenSubject();
    this.listenMessage();
    this.listenFile();

    this.listenForm();
  }

  public run() {
    this.listen();
    this.configureOptionCountries();
    this.updateMessageHelper();
  }

  public static get instance() {
    return new ContactPageManager();
  }
}
