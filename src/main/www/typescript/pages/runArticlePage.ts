export function runArticlePage() {
  const editors = document.querySelectorAll<HTMLElement>('.editor-container');

  if (editors.length & 1) editors[editors.length - 1].style.gridColumn = 'span 2';

  editors.forEach((editor) => {
    const link = editor.querySelector('a');
    const name = editor.querySelector<HTMLElement>('.editor-name');
    const bio = editor.querySelector<HTMLElement>('.editor-bio');

    [name, bio].forEach((elm) => {
      elm.onclick = () => link.click();
      elm.style.cursor = 'pointer';
    });
  });
}
