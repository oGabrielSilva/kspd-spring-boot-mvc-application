import type { ArticleValidation } from '../../validations/ArticleValidation';
import { Editor } from '@tiptap/core';
import { hideModal, showModal } from '../../libs/Bulma';
import { tools } from '../../utilities/tools';
import { generateHTML } from '../../utilities/generateHtml';
import { extensions } from '../../libs/Tiptap';

interface UnsavedImages {
  blobs: Array<{ blob: Blob; id: string }>;
}

export function editor(validation: ArticleValidation) {
  const { anim, toaster, image, screenProgress } = tools();
  const unsavedImages: UnsavedImages = { blobs: [] };

  const article = document.querySelector('#article-content') as HTMLElement;
  const editor = new Editor({
    element: article,
    extensions,
    content: article.dataset.content,
    autofocus: true,
  });

  const toolbar = document.querySelector('#toolbar');

  const bold = toolbar.querySelector('#bold') as HTMLButtonElement;
  const italic = toolbar.querySelector('#italic') as HTMLButtonElement;
  const underline = toolbar.querySelector('#underline') as HTMLButtonElement;
  const strike = toolbar.querySelector('#strike') as HTMLButtonElement;
  const color = toolbar.querySelector('#color') as HTMLButtonElement;
  const colorInput = color.querySelector('input');
  const bg = toolbar.querySelector('#bg') as HTMLButtonElement;
  const bgInput = bg.querySelector('input');
  const leftAlign = toolbar.querySelector('#align-left') as HTMLButtonElement;
  const rightAlign = toolbar.querySelector('#align-right') as HTMLButtonElement;
  const centerAlign = toolbar.querySelector('#align-center') as HTMLButtonElement;
  const justifyAlign = toolbar.querySelector('#align-justify') as HTMLButtonElement;
  const listUl = toolbar.querySelector('#list-ul') as HTMLButtonElement;
  const listOl = toolbar.querySelector('#list-ol') as HTMLButtonElement;
  const indent = toolbar.querySelector('#indent') as HTMLButtonElement;
  const outdent = toolbar.querySelector('#outdent') as HTMLButtonElement;
  const quote = toolbar.querySelector('#quote') as HTMLButtonElement;
  const code = toolbar.querySelector('#code') as HTMLButtonElement;
  const cut = toolbar.querySelector('#cut') as HTMLButtonElement;
  const copy = toolbar.querySelector('#copy') as HTMLButtonElement;
  const paste = toolbar.querySelector('#paste') as HTMLButtonElement;
  const h1 = toolbar.querySelector('#title') as HTMLButtonElement;
  const h2 = toolbar.querySelector('#subtitle') as HTMLButtonElement;
  const h3 = toolbar.querySelector('#subtitle-3') as HTMLButtonElement;
  const superscript = toolbar.querySelector('#superscript') as HTMLButtonElement;
  const subscript = toolbar.querySelector('#subscript') as HTMLButtonElement;
  const link = toolbar.querySelector('#link') as HTMLButtonElement;
  const linkModal = document.querySelector('#link-modal') as HTMLElement;
  const linkInput = linkModal.querySelector('#link-href') as HTMLInputElement;
  const linkTitleInput = linkModal.querySelector('#link-title') as HTMLInputElement;
  const linkTitleDad = Array.from(linkModal.querySelectorAll('.mb-3')).find((m3) =>
    m3.contains(linkTitleInput)
  ) as HTMLElement;
  const youtube = toolbar.querySelector('#youtube') as HTMLButtonElement;
  const youtubeModal = document.querySelector('#youtube-modal') as HTMLElement;
  const youtubeInput = youtubeModal.querySelector('input');
  const figure = toolbar.querySelector('#add-figure') as HTMLButtonElement;
  const figureInput = figure.querySelector('input');

  bold.onclick = () => editor.chain().focus().toggleBold().run();
  italic.onclick = () => editor.chain().focus().toggleItalic().run();
  underline.onclick = () => editor.chain().focus().toggleUnderline().run();
  strike.onclick = () => editor.chain().focus().toggleStrike().run();
  color.onclick = () => colorInput.click();
  colorInput.onchange = () => {
    editor.chain().focus().setColor(colorInput.value).run();
    editor.commands.blur();
  };
  bg.onclick = () => bgInput.click();
  bgInput.onchange = () => {
    editor.chain().focus().setHighlight({ color: bgInput.value }).run();
    editor.commands.blur();
  };
  leftAlign.onclick = () => editor.chain().focus().setTextAlign('left').run();
  rightAlign.onclick = () => editor.chain().focus().setTextAlign('right').run();
  centerAlign.onclick = () => editor.chain().focus().setTextAlign('center').run();
  justifyAlign.onclick = () => editor.chain().focus().setTextAlign('justify').run();
  listUl.onclick = () => editor.chain().focus().toggleBulletList().run();
  listOl.onclick = () => editor.chain().focus().toggleOrderedList().run();
  indent.onclick = () => editor.chain().focus().indent().run();
  outdent.onclick = () => editor.chain().focus().outdent().run();
  quote.onclick = () => editor.chain().focus().toggleBlockquote().run();
  code.onclick = () => editor.chain().focus().toggleCodeBlock().run();
  cut.onclick = async () => {
    const selection = window.getSelection();
    if (selection.rangeCount < 1) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    try {
      await navigator.clipboard.writeText(selectedText);
      range.deleteContents();
    } catch (err) {
      console.error(err);
    }
    selection.removeAllRanges();
  };
  copy.onclick = async () => {
    const selection = window.getSelection();
    if (selection.rangeCount < 1) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    try {
      await navigator.clipboard.writeText(selectedText);
    } catch (err) {
      console.error(err);
    }
  };
  paste.onclick = async () => {
    const txt = await navigator.clipboard.readText();
    editor.chain().focus().insertContent(txt).run();
  };
  h1.onclick = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  h2.onclick = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  h3.onclick = () => editor.chain().focus().toggleHeading({ level: 3 }).run();
  superscript.onclick = () => editor.chain().focus().toggleSuperscript().run();
  subscript.onclick = () => editor.chain().focus().toggleSubscript().run();
  link.onclick = () => {
    const sel = window.getSelection();
    if (sel.rangeCount < 1 || sel.getRangeAt(0).collapsed)
      linkTitleDad.classList.remove('is-hidden');
    else linkTitleDad.classList.add('is-hidden');

    showModal(linkModal);
  };
  linkModal.onsubmit = (e) => {
    e.preventDefault();
    if (!validation.isURLValid(linkInput.value)) {
      anim.shake(linkInput);
      toaster.info(linkInput.dataset.message);
      return;
    }
    const withTitle = !linkTitleDad.classList.contains('is-hidden');
    if (withTitle && linkTitleInput.value.length < 1) {
      anim.shake(linkTitleInput);
      toaster.info(linkTitleInput.dataset.message);
      return;
    }
    if (withTitle)
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${linkInput.value}" rel="noopener noreferrer" target="_blank">${linkTitleInput.value}</a> `
        )
        .run();
    else editor.chain().focus().toggleLink({ href: linkInput.value }).run();
    linkInput.value = '';
    linkTitleInput.value = '';
    linkInput.classList.remove('is-danger');
    linkTitleInput.classList.remove('is-danger');
    linkTitleDad.classList.remove('is-hidden');
    hideModal(linkModal);
  };
  linkInput.oninput = () =>
    linkInput.value && validation.isURLValid(linkInput.value)
      ? linkInput.classList.remove('is-danger')
      : linkInput.classList.add('is-danger');
  linkTitleInput.oninput = () =>
    linkTitleInput.value.length >= 1
      ? linkTitleInput.classList.remove('is-danger')
      : linkTitleInput.classList.add('is-danger');
  youtube.onclick = () => showModal(youtubeModal);
  youtubeInput.oninput = () =>
    youtubeInput.value && validation.isYouTubeURLValid(youtubeInput.value)
      ? youtubeInput.classList.remove('is-danger')
      : youtubeInput.classList.add('is-danger');
  youtubeModal.onsubmit = (e) => {
    e.preventDefault();
    if (!validation.isYouTubeURLValid(youtubeInput.value)) {
      anim.shake(youtubeInput);
      toaster.info(youtubeInput.dataset.message);
      return;
    }
  };
  figure.onclick = () => figureInput.click();
  figureInput.oninput = async () => {
    if (!figureInput.files[0]) return;
    screenProgress.show();
    try {
      const file = figureInput.files[0];
      const blob = await image.fileToBlobWebpWithoutResize(file);
      const url = URL.createObjectURL(blob);
      const id = 'IMG-' + Date.now().toString(36) + '_' + document.querySelectorAll('img').length;
      unsavedImages.blobs.push({ blob, id });
      const title = file.name.split('.')[0].split(' ').join('');
      const html = generateHTML({
        htmlType: 'figure',
        attributes: [
          { key: 'data-id', value: id },
          { key: 'class', value: 'k-figure' },
        ],
        children: [
          {
            htmlType: 'img',
            attributes: [
              { key: 'id', value: id },
              { key: 'alt', value: title },
              { key: 'title', value: title },
              { key: 'loading', value: 'lazy' },
              { key: 'src', value: url },
            ],
          },
          {
            htmlType: 'figcaption',
            value: file.name.split('.')[0],
          },
        ],
      });
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  };
}
