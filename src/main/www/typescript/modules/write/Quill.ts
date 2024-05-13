import QuillIcons from 'quill/ui/icons';
import QuillBlotsEmbed from 'quill/blots/embed';
import type Quill from 'quill';
import type { QuillOptions } from 'quill';
import { ImageProcessingTool } from '../../tools/ImageProcessingTool';

QuillIcons.bold = '<i class="fa-solid fa-bold"></i>';
QuillIcons.italic = '<i class="fa-solid fa-italic"></i>';
QuillIcons.blockquote = '<i class="fa-solid fa-quote-right"></i>';
QuillIcons['code-block'] = '<i class="fa-solid fa-code"></i>';
QuillIcons.list.bullet = '<i class="fa-solid fa-list-ul"></i>';
QuillIcons.list.ordered = '<i class="fa-solid fa-list-ol"></i>';
QuillIcons.image = '<i class="fa-solid fa-images"></i>';
QuillIcons.link = '<i class="fa-solid fa-link"></i>';
QuillIcons.align[''] = '<i class="fa-solid fa-align-left"></i>';
QuillIcons.align.justify = '<i class="fa-solid fa-align-justify"></i>';
QuillIcons.align.right = '<i class="fa-solid fa-align-right"></i>';
QuillIcons.align.center = '<i class="fa-solid fa-align-center"></i>';
QuillIcons.header[1] = '<i class="bi bi-type-h1"></i>';
QuillIcons.header[2] = '<i class="bi bi-type-h2"></i>';
QuillIcons.underline = '<i class="fa-solid fa-underline"></i>';
QuillIcons.strike = '<i class="fa-solid fa-strikethrough"></i>';
QuillIcons.video = '<i class="fa-solid fa-film"></i>';
QuillIcons.formula = '<i class="fa-solid fa-square-root-variable"></i>';
QuillIcons.indent['+1'] = '<i class="fa-solid fa-indent"></i>';
QuillIcons.indent['-1'] = '<i class="fa-solid fa-outdent"></i>';
QuillIcons.script.sub = '<i class="fa-solid fa-subscript"></i>';
QuillIcons.script.super = '<i class="fa-solid fa-superscript"></i>';

export class ImageBlot extends QuillBlotsEmbed {
  static editor: Quill;

  static onFigureClick = (
    img: HTMLImageElement,
    figcaption: HTMLElement,
    figure: HTMLElement
  ) => {};

  static create(value: { url: string; name: string }) {
    const node = document.createElement('img');
    const figure = document.createElement('figure');
    const figcaption = document.createElement('figcaption');

    figure.id = 'figure-' + Date.now();

    figcaption.id = figure.id.replace('figure', 'figcaption-img');
    figcaption.textContent = value.name;

    node.setAttribute('src', value.url);
    node.setAttribute('alt', value.name);
    node.setAttribute('title', value.name);
    node.loading = 'lazy';
    node.setAttribute('class', 'art-img');
    node.setAttribute('aria-labelledby', figcaption.id);
    node.id = figure.id.replace('figure', 'img');

    figure.append(node, figcaption);
    ImageBlot.configureFigure(figure, node, figcaption);
    return figure;
  }

  static value(node: Element) {
    return {
      url: node.getAttribute('src'),
    };
  }

  static configureFigure(figure: HTMLElement, img: HTMLImageElement, figcaption: HTMLElement) {
    figure.addEventListener('click', () => ImageBlot.onFigureClick(img, figcaption, figure));
  }
}

export const quillConfiguration: (
  imageProcessor: ImageProcessingTool,
  placeholder: string
) => QuillOptions = (imageProcessor, placeholder) => {
  return {
    theme: 'snow',
    modules: {
      toolbar: {
        container: [
          [{ size: [] }],
          [{ header: 1 }, { header: 2 }, 'blockquote', 'code-block'],
          [{ color: [] }, { background: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
          [{ list: 'bullet' }, { list: 'ordered' }],
          ['image', 'video', 'link'],
          [{ indent: '+1' }, { indent: '-1' }, 'formula'],
          [{ script: 'sub' }, { script: 'super' }],
          ['clean'],
        ],
        // handlers: {
        //   image: () => {
        //     const fileInput = document.createElement('input');
        //     fileInput.setAttribute('type', 'file');
        //     fileInput.setAttribute('accept', 'image/*');
        //     fileInput.click();

        //     fileInput.onchange = async () => {
        //       const file = fileInput.files[0];
        //       if (file) {
        //         const blob = await imageProcessor.fileToBlobWebpWithoutResize(file, 0.85);
        //         const range = ImageBlot.editor.getSelection();
        //         const url = URL.createObjectURL(blob);
        //         ImageBlot.editor.insertEmbed(range.index, 'image', {
        //           url,
        //           name: file.name.split('.')[0],
        //         });
        //       }
        //     };
        //   },
        // },
      },
    },
    placeholder,
    debug: 'error',
  } as QuillOptions;
};
