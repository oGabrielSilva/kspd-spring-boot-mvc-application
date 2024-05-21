import type { ArticleValidation } from '../../validations/ArticleValidation';
import { Editor } from '@tiptap/core';
import { hideModal, showModal } from '../../libs/Bulma';
import { tools } from '../../utilities/tools';
import { generateHTML } from '../../utilities/generateHtml';
import { extensions, toolbar } from '../../libs/Tiptap';
import { deleteBlob } from './deleteBlob';
import { uploadBlob } from './uploadBlob';

export class TipTapBasedHTMLEditor {
  static slug: string;

  static initialize(article: HTMLElement, validation: ArticleValidation) {
    const { anim, toaster, image, screenProgress } = tools();

    const editor = new Editor({
      element: article,
      extensions: extensions(article.dataset.placeholder),
      content: article.dataset.content,
      autofocus: true,
    });

    const tool = toolbar();

    function updateToolTextAlignColor(selectedItem?: HTMLButtonElement) {
      if (selectedItem) {
        tool.leftAlign.style.color =
          selectedItem.id === tool.leftAlign.id ? 'var(--bulma-primary)' : '';
        tool.rightAlign.style.color =
          selectedItem.id === tool.rightAlign.id ? 'var(--bulma-primary)' : '';
        tool.centerAlign.style.color =
          selectedItem.id === tool.centerAlign.id ? 'var(--bulma-primary)' : '';
        tool.justifyAlign.style.color =
          selectedItem.id === tool.justifyAlign.id ? 'var(--bulma-primary)' : '';
        return;
      }
      tool.leftAlign.style.color = editor.isActive({ textAlign: 'left' })
        ? 'var(--bulma-primary)'
        : '';
      tool.rightAlign.style.color = editor.isActive({ textAlign: 'right' })
        ? 'var(--bulma-primary)'
        : '';
      tool.centerAlign.style.color = editor.isActive({ textAlign: 'center' })
        ? 'var(--bulma-primary)'
        : '';
      tool.justifyAlign.style.color = editor.isActive({ textAlign: 'justify' })
        ? 'var(--bulma-primary)'
        : '';
    }

    editor.on('selectionUpdate', () => {
      tool.bold.style.color = editor.isActive('bold') ? 'var(--bulma-primary)' : '';
      tool.italic.style.color = editor.isActive('italic') ? 'var(--bulma-primary)' : '';
      tool.underline.style.color = editor.isActive('underline') ? 'var(--bulma-primary)' : '';
      tool.strike.style.color = editor.isActive('strike') ? 'var(--bulma-primary)' : '';
      tool.color.style.color = editor.getAttributes('textStyle').color ?? '';
      tool.colorInput.value = editor.getAttributes('textStyle').color ?? '';
      tool.bg.style.color = editor.getAttributes('highlight').color ?? '';
      tool.bgInput.value = editor.getAttributes('highlight').color ?? '';
      tool.listUl.style.color = editor.isActive('bulletList') ? 'var(--bulma-primary)' : '';
      tool.listOl.style.color = editor.isActive('orderedList') ? 'var(--bulma-primary)' : '';
      tool.quote.style.color = editor.isActive('blockquote') ? 'var(--bulma-primary)' : '';
      tool.code.style.color = editor.isActive('codeBlock') ? 'var(--bulma-primary)' : '';
      tool.h1.style.color = editor.isActive('heading', { level: 1 }) ? 'var(--bulma-primary)' : '';
      tool.h2.style.color = editor.isActive('heading', { level: 2 }) ? 'var(--bulma-primary)' : '';
      tool.h3.style.color = editor.isActive('heading', { level: 3 }) ? 'var(--bulma-primary)' : '';
      tool.subscript.style.color = editor.isActive('subscript') ? 'var(--bulma-primary)' : '';
      tool.superscript.style.color = editor.isActive('superscript') ? 'var(--bulma-primary)' : '';
      updateToolTextAlignColor();
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
    tool.leftAlign.onclick = () => {
      editor.chain().focus().setTextAlign('left').run();
      updateToolTextAlignColor(tool.leftAlign);
    };
    tool.rightAlign.onclick = () => {
      editor.chain().focus().setTextAlign('right').run();
      updateToolTextAlignColor(tool.rightAlign);
    };
    tool.centerAlign.onclick = () => {
      editor.chain().focus().setTextAlign('center').run();
      updateToolTextAlignColor(tool.centerAlign);
    };
    tool.justifyAlign.onclick = () => {
      editor.chain().focus().setTextAlign('justify').run();
      updateToolTextAlignColor(tool.justifyAlign);
    };
    tool.listUl.onclick = () => editor.chain().focus().toggleBulletList().run();
    tool.listOl.onclick = () => editor.chain().focus().toggleOrderedList().run();
    tool.indent.onclick = () => editor.chain().focus().indent().run();
    tool.outdent.onclick = () => editor.chain().focus().outdent().run();
    tool.quote.onclick = () => editor.chain().focus().toggleBlockquote().run();
    tool.code.onclick = () => {
      editor.chain().focus().toggleCodeBlock().run();
      tool.code.style.color = editor.isActive('codeBlock') ? 'var(--bulma-primary)' : '';
    };
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
    tool.h1.onclick = () => {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      tool.h1.style.color = editor.isActive('heading', { level: 1 }) ? 'var(--bulma-primary)' : '';
    };
    tool.h2.onclick = () => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      tool.h2.style.color = editor.isActive('heading', { level: 2 }) ? 'var(--bulma-primary)' : '';
    };
    tool.h3.onclick = () => {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      tool.h3.style.color = editor.isActive('heading', { level: 3 }) ? 'var(--bulma-primary)' : '';
    };
    tool.superscript.onclick = () => {
      if (editor.isActive('subscript')) {
        editor.commands.unsetSubscript();
        tool.subscript.style.color = '';
      }
      editor.chain().focus().toggleSuperscript().run();
      tool.superscript.style.color = editor.isActive('superscript') ? 'var(--bulma-primary)' : '';
    };
    tool.subscript.onclick = () => {
      if (editor.isActive('superscript')) {
        editor.commands.unsetSuperscript();
        tool.superscript.style.color = '';
      }
      editor.chain().focus().toggleSubscript().run();
      tool.subscript.style.color = editor.isActive('subscript') ? 'var(--bulma-primary)' : '';
    };
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
        const blob = await image.fileToBlobWebpWithoutResize(file, 0.8);
        console.log('Original:', file.size);
        console.log('New:', blob.size);
        if (blob.size / (1024 * 1024) > 5) {
          toaster.alert(tool.figureInput.dataset.message);
          return;
        }
        const { url, id: nanoId } = await uploadBlob(blob, TipTapBasedHTMLEditor.slug);
        if (!url) return;
        const id = 'IMG-' + Date.now().toString(36) + '_' + document.querySelectorAll('img').length;
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
              { key: 'data-nano', value: nanoId },
            ],
          }),
          generateHTML({
            htmlType: 'figcaption',
            value: file.name,
          })
        );
        const content = generateHTML({ htmlType: 'p' });
        content.appendChild(html);
        editor.chain().focus().insertContent(content.outerHTML).run();
        const figure = article.querySelector<HTMLElement>(`figure[data-id=${id}]`);
        const figureIMG = figure.querySelector('img');
        const figcaption = figure.querySelector('figcaption');
        updateFigureClicks(figure, figureIMG, figcaption);
      } catch (error) {
        console.log(error);
        toaster.danger();
      } finally {
        screenProgress.hide();
      }
    };
    tool.fontFamily.oninput = updateFont;
    tool.clean.onclick = () => {
      editor
        .chain()
        .focus()
        .unsetBold()
        .unsetItalic()
        .unsetUnderline()
        .unsetStrike()
        .unsetBlockquote()
        .unsetCode()
        .unsetColor()
        .unsetHighlight()
        .unsetLink()
        .unsetSubscript()
        .unsetSuperscript()
        .run();
    };

    function updateFont() {
      const font = tool.fontFamily.value;
      const type = tool.fontFamily.querySelector<HTMLElement>(`option[value="${font}"]`).dataset
        .type;
      article.style.fontFamily = `"${font}", ${type}`;
    }

    function updateFigureClicks(
      figure: HTMLElement,
      figureIMG: HTMLImageElement,
      figcaption: HTMLElement
    ) {
      [figureIMG, figcaption].forEach(
        (item) =>
          (item.onclick = () =>
            tool.configureAndShowFigureModal(figure, figureIMG, figcaption, () => {
              const nanoId = figureIMG.dataset.nano;
              const node = editor
                .$nodes('figure')
                .find((node) => node.element.dataset.id === figureIMG.id);
              if (node) {
                deleteBlob(nanoId, TipTapBasedHTMLEditor.slug)
                  .then((success) => {
                    if (success) editor.commands.deleteNode(node.node.type);
                  })
                  .catch(console.log);
              }
            }))
      );
    }

    editor.view.dom.querySelectorAll('figure').forEach((figure) => {
      const img = figure.querySelector('img');
      const figcaption = figure.querySelector('figcaption');
      if (img.draggable) img.draggable = false;
      if (img.id === figure.dataset.id && img.dataset.nano) {
        updateFigureClicks(figure, img, figcaption);
      }
    });

    updateFont();
    return { editor, tool };
  }
}
