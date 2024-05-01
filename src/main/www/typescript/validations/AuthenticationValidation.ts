export class AuthenticationValidation {
  private readonly emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly usernameRegex = /[^a-zA-Z0-9\-_.]/g;

  public isEmailValid(email: string) {
    return typeof email === 'string' && this.emailRegex.test(email);
  }

  public isPasswordValid(password: string) {
    return typeof password === 'string' && password.length >= 8;
  }

  public isNameValid(name: string) {
    return typeof name === 'string' && name.length >= 2;
  }

  public isUsernameValid(username: string) {
    return typeof username === 'string' && username.length >= 1;
  }

  public normalizeUsername(username: string) {
    return username.trim().replace(this.usernameRegex, '');
  }
}
