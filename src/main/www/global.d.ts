declare global {
  interface RestException {
    message: string;
  }

  interface User {
    email: string;
    name: string;
    username: string;
    bio: string;
    avatarURL: string;
    social: {
      x: string;
      youtube: string;
      instagram: string;
      linkedin: string;
      github: string;
      site: string;
    };
    roles: Array<string>;
    isEmailChecked: boolean;
  }
}

export {};
