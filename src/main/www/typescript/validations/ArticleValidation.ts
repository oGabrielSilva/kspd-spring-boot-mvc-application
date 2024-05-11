export class ArticleValidation {
  private readonly slugRegex = /[^a-zA-Z0-9 ]/g;

  public extractSlug(content: string) {
    return content
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(this.slugRegex, '')
      .split(' ')
      .join('-');
  }
}
