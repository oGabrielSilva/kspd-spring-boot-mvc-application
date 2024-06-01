export class ArticlePageManager {
  private readonly editors = document.querySelectorAll<HTMLElement>('.editor-container');

  private configureEditorsGrid() {
    if (this.editors.length & 1) this.editors[this.editors.length - 1].style.gridColumn = 'span 2';
  }

  private configureEditorsClick() {
    this.editors.forEach((editor) => {
      const link = editor.querySelector('a');
      const name = editor.querySelector<HTMLElement>('.editor-name');
      const bio = editor.querySelector<HTMLElement>('.editor-bio');

      [name, bio].forEach((elm) => {
        elm.onclick = () => link.click();
        elm.style.cursor = 'pointer';
      });
    });
  }

  public run() {
    this.configureEditorsGrid();
    this.configureEditorsClick();
  }

  public static get instance() {
    return new ArticlePageManager();
  }
}
