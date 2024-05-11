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

  interface ArticleLinks {
    content: string;
    edit: string;
  }

  interface Stack {
    name: string;
    description: string;
  }

  interface Article {
    links: ArticleLinks;
    slug: string;
    title: string;
    content: string;
    description: string;
    keywords: Array<String>;
    stacks: Array<Stack>;
    editors: Array<User>;
    views: number;
    lang: string;
  }
}

export {};
