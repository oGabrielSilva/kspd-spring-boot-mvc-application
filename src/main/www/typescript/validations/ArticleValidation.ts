export class ArticleValidation {
  private readonly slugRegex = /[^a-zA-Z0-9-_]/g;
  readonly URLRegex =
    /(https:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

  public isURLValid(link: string) {
    return !link.startsWith('http:') && this.URLRegex.test(link);
  }

  public isYouTubeURLValid(link: string) {
    return (link.includes('youtube') || link.includes('youtu.be')) && this.isURLValid(link);
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

  public extractKeywords(content: string, savedKeywords: Array<string>) {
    return content
      .trim()
      .split(',')
      .map((preKey) => preKey.trim())
      .join(';')
      .split(';')
      .map((key) => {
        const value = key.trim();
        return savedKeywords.indexOf(value) >= 0 ? null : value;
      })
      .filter((key) => key !== null && key !== '' && key !== ' ');
  }
}
