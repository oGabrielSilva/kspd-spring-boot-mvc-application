export class ProfileArticlePageManager {
  private readonly articles = document.querySelectorAll('.each-article');

  private configureOnArticleClicked() {
    this.articles.forEach((article) => {
      article.addEventListener('click', ({ target }) => {
        if (target instanceof HTMLAnchorElement) return;

        article.querySelector('a').click();
      });
    });
  }

  public run() {
    this.configureOnArticleClicked();
  }

  public static get instance() {
    return new ProfileArticlePageManager();
  }
}
