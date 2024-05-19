import type { ArticleValidation } from '../../validations/ArticleValidation';
import { Editor } from '@tiptap/core';
import { hideModal, showModal } from '../../libs/Bulma';
import { tools } from '../../utilities/tools';
import { generateHTML } from '../../utilities/generateHtml';
import { extensions, toolbar } from '../../libs/Tiptap';

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

  const tool = toolbar();

  article.style.fontFamily = tool.fontFamily.querySelector('option').value;

  editor.on('selectionUpdate', () => {
    tool.bold.style.color = editor.isActive('bold') ? 'var(--bulma-primary)' : '';
    tool.italic.style.color = editor.isActive('italic') ? 'var(--bulma-primary)' : '';
    tool.underline.style.color = editor.isActive('underline') ? 'var(--bulma-primary)' : '';
    tool.strike.style.color = editor.isActive('strike') ? 'var(--bulma-primary)' : '';
    tool.color.style.color = editor.getAttributes('textStyle').color ?? '';
    tool.colorInput.value = editor.getAttributes('textStyle').color ?? '';
    tool.bg.style.color = editor.getAttributes('highlight').color ?? '';
    tool.bgInput.value = editor.getAttributes('highlight').color ?? '';
  });

  tool.bold.onclick = () => {
    editor.chain().focus().toggleBold().run();
    tool.bold.style.color = editor.isActive('bold') ? 'var(--bulma-primary)' : '';
  };
  tool.italic.onclick = () => {
    editor.chain().focus().toggleItalic().run();
    tool.italic.style.color = editor.isActive('italic') ? 'var(--bulma-primary)' : '';
  };
  tool.underline.onclick = () => {
    editor.chain().focus().toggleUnderline().run();
    tool.underline.style.color = editor.isActive('underline') ? 'var(--bulma-primary)' : '';
  };
  tool.strike.onclick = () => {
    editor.chain().focus().toggleStrike().run();
    tool.strike.style.color = editor.isActive('strike') ? 'var(--bulma-primary)' : '';
  };
  tool.color.onclick = () => tool.colorInput.click();
  tool.colorInput.oninput = () => {
    editor.chain().focus().setColor(tool.colorInput.value).run();
    tool.color.style.color = tool.colorInput.value;
    editor.commands.blur();
  };
  tool.bg.onclick = () => tool.bgInput.click();
  tool.bgInput.oninput = () => {
    editor.chain().focus().setHighlight({ color: tool.bgInput.value }).run();
    tool.bg.style.color = tool.bgInput.value;
    editor.commands.blur();
  };
  tool.leftAlign.onclick = () => editor.chain().focus().setTextAlign('left').run();
  tool.rightAlign.onclick = () => editor.chain().focus().setTextAlign('right').run();
  tool.centerAlign.onclick = () => editor.chain().focus().setTextAlign('center').run();
  tool.justifyAlign.onclick = () => editor.chain().focus().setTextAlign('justify').run();
  tool.listUl.onclick = () => editor.chain().focus().toggleBulletList().run();
  tool.listOl.onclick = () => editor.chain().focus().toggleOrderedList().run();
  tool.indent.onclick = () => editor.chain().focus().indent().run();
  tool.outdent.onclick = () => editor.chain().focus().outdent().run();
  tool.quote.onclick = () => editor.chain().focus().toggleBlockquote().run();
  tool.code.onclick = () => editor.chain().focus().toggleCodeBlock().run();
  tool.cut.onclick = async () => {
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
  tool.copy.onclick = async () => {
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
  tool.paste.onclick = async () => {
    const txt = await navigator.clipboard.readText();
    editor.chain().focus().insertContent(txt).run();
  };
  tool.h1.onclick = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  tool.h2.onclick = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  tool.h3.onclick = () => editor.chain().focus().toggleHeading({ level: 3 }).run();
  tool.superscript.onclick = () => editor.chain().focus().toggleSuperscript().run();
  tool.subscript.onclick = () => editor.chain().focus().toggleSubscript().run();
  tool.link.onclick = () => {
    const sel = window.getSelection();
    if (sel.rangeCount < 1 || sel.getRangeAt(0).collapsed)
      tool.linkTitleDad.classList.remove('is-hidden');
    else tool.linkTitleDad.classList.add('is-hidden');

    showModal(tool.linkModal);
  };
  tool.linkModal.onsubmit = (e) => {
    e.preventDefault();
    if (!validation.isURLValid(tool.linkInput.value)) {
      anim.shake(tool.linkInput);
      toaster.info(tool.linkInput.dataset.message);
      return;
    }
    const withTitle = !tool.linkTitleDad.classList.contains('is-hidden');
    if (withTitle && tool.linkTitleInput.value.length < 1) {
      anim.shake(tool.linkTitleInput);
      toaster.info(tool.linkTitleInput.dataset.message);
      return;
    }
    if (withTitle)
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${tool.linkInput.value}" rel="noopener noreferrer" target="_blank">${tool.linkTitleInput.value}</a> `
        )
        .run();
    else editor.chain().focus().toggleLink({ href: tool.linkInput.value }).run();
    tool.linkInput.value = '';
    tool.linkTitleInput.value = '';
    tool.linkInput.classList.remove('is-danger');
    tool.linkTitleInput.classList.remove('is-danger');
    tool.linkTitleDad.classList.remove('is-hidden');
    hideModal(tool.linkModal);
  };
  tool.linkInput.oninput = () =>
    tool.linkInput.value && validation.isURLValid(tool.linkInput.value)
      ? tool.linkInput.classList.remove('is-danger')
      : tool.linkInput.classList.add('is-danger');
  tool.linkTitleInput.oninput = () =>
    tool.linkTitleInput.value.length >= 1
      ? tool.linkTitleInput.classList.remove('is-danger')
      : tool.linkTitleInput.classList.add('is-danger');
  tool.youtube.onclick = () => showModal(tool.youtubeModal);
  tool.youtubeInput.oninput = () =>
    tool.youtubeInput.value && validation.isYouTubeURLValid(tool.youtubeInput.value)
      ? tool.youtubeInput.classList.remove('is-danger')
      : tool.youtubeInput.classList.add('is-danger');
  tool.youtubeModal.onsubmit = (e) => {
    e.preventDefault();
    if (!validation.isYouTubeURLValid(tool.youtubeInput.value)) {
      anim.shake(tool.youtubeInput);
      toaster.info(tool.youtubeInput.dataset.message);
      return;
    }
  };
  tool.figure.onclick = () => tool.figureInput.click();
  tool.figureInput.oninput = async () => {
    if (!tool.figureInput.files[0]) return;
    screenProgress.show();
    try {
      const file = tool.figureInput.files[0];
      const blob = await image.fileToBlobWebpWithoutResize(file);
      const url = URL.createObjectURL(blob);
      const id = 'IMG-' + Date.now().toString(36) + '_' + document.querySelectorAll('img').length;
      unsavedImages.blobs.push({ blob, id });
      const html = generateHTML({
        htmlType: 'figure',
        attributes: [{ key: 'data-id', value: id }],
      });
      html.append(
        generateHTML<HTMLImageElement>({
          htmlType: 'img',
          attributes: [
            { key: 'id', value: id },
            { key: 'alt', value: file.name },
            { key: 'title', value: file.name },
            { key: 'aria-label', value: '' },
            { key: 'loading', value: 'lazy' },
            { key: 'src', value: url },
          ],
        }),
        generateHTML({
          htmlType: 'figcaption',
          value: file.name,
        })
      );
      editor.chain().focus().insertContent(html.outerHTML).run();
      const figure = article.querySelector<HTMLElement>(`figure[data-id=${id}]`);
      const figureIMG = figure.querySelector('img');
      const figcaption = figure.querySelector('figcaption');
      [figureIMG, figcaption].forEach(
        (item) =>
          (item.onclick = () =>
            tool.configureAndShowFigureModal(figure, figureIMG, figcaption, () => {
              const node = editor.$nodes('figure').find((node) => node.element.dataset.id === id);
              if (node) editor.commands.deleteNode(node.node.type);
            }))
      );
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  };
  tool.fontFamily.oninput = () => {
    article.style.fontFamily = tool.fontFamily.value;
  };
}
