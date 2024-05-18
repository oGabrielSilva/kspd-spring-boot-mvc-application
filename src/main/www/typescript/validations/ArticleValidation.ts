export class ArticleValidation {
  private readonly slugRegex = /[^a-zA-Z0-9-_]/g;
  readonly URLRegex =
    /(https:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

  public URLIsValid(link: string) {
    return !link.startsWith('http:') && this.URLRegex.test(link);
  }

  public extractSlug(content: string) {
    return content
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(this.slugRegex, ' ')
      .split(' ')
      .join('-');
  }
}
