import type { ArticleValidation } from '../../validations/ArticleValidation';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Indent from '@weiruo/tiptap-extension-indent';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import { hideModal, showModal } from '../../libs/Bulma';

export function editor(validation: ArticleValidation) {
  const article = document.querySelector('#article-content') as HTMLElement;

  const editor = new Editor({
    element: article,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Indent.configure({ types: ['listItem', 'paragraph'], minLevel: 0, maxLevel: 8 }),
      Subscript,
      Superscript,
      Link.configure({
        protocols: ['ftp', 'mailto'],
        openOnClick: 'whenNotEditable',
        validate: (href) => /^https?:\/\//.test(href),
        autolink: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
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
  const linkWithTitleModal = document.querySelector('#link-modal') as HTMLElement;
  const linkInput = linkWithTitleModal.querySelector('#link-href') as HTMLInputElement;

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
    if (sel.rangeCount < 1 || sel.getRangeAt(0).collapsed) showModal(linkWithTitleModal);
  };
  linkWithTitleModal.onsubmit = (e) => {
    e.preventDefault();
    if (!validation.URLIsValid(linkInput.value)) {
      return;
    }
    hideModal(linkWithTitleModal);
  };
  linkInput.oninput = () =>
    linkInput.value && validation.URLIsValid(linkInput.value)
      ? linkInput.classList.remove('is-danger')
      : linkInput.classList.add('is-danger');
}
