import { AuthenticationValidation } from './AuthenticationValidation';

export class ContactValidation {
  public static readonly messageMaxLen = 1000;
  public static readonly fileMaxLen = 5e6;

  public isNameValid(name: string) {
    return typeof name === 'string' && name.trim().length >= 1;
  }

  public isEmailValid(email: string) {
    return typeof email === 'string' && AuthenticationValidation.emailRegex.test(email);
  }

  public isSubjectValid(subject: string) {
    return typeof subject === 'string' && subject.trim().length >= 1;
  }

  public isMessageValid(message: string) {
    return (
      typeof message === 'string' &&
      message.trim().length > 1 &&
      message.trim().length <= ContactValidation.messageMaxLen
    );
  }

  public isFileValid(fileSize: number) {
    return fileSize > 0 && fileSize <= ContactValidation.fileMaxLen;
  }
}
