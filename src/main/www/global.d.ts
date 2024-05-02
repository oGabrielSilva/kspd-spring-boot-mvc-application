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
    social: Social;
    roles: Array<string>;
    isEmailChecked: boolean;
  }

  interface Social {
    x: string;
    youtube: string;
    instagram: string;
    linkedin: string;
    github: string;
    site: string;
  }
}

export {};
