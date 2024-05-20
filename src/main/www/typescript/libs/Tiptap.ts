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
import Youtube from '@tiptap/extension-youtube';
import { hideModal, showModal } from './Bulma';
import { Figcaption, Figure, FigureImage } from '../libs/FigureTipTap';
import Placeholder from '@tiptap/extension-placeholder';

export const extensions = (placeholder: string) => [
  StarterKit,
  Underline,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
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
  Youtube.configure({
    inline: false,
    width: 320,
    height: 240,
    controls: true,
    nocookie: true,
    allowFullscreen: true,
    autoplay: false,
    disableKBcontrols: true,
    enableIFrameApi: true,
  }),
  Figure,
  FigureImage,
  Figcaption,
  Placeholder.configure({
    placeholder,
    showOnlyWhenEditable: true,
  }),
];

const toolbarHTMLTipTapElement = document.querySelector('#toolbar');
export const toolbar = () => {
  const color = toolbarHTMLTipTapElement.querySelector('#color') as HTMLButtonElement;
  const bg = toolbarHTMLTipTapElement.querySelector('#bg') as HTMLButtonElement;
  const linkModal = document.querySelector('#link-modal') as HTMLElement;
  const linkTitleInput = linkModal.querySelector('#link-title') as HTMLInputElement;
  const youtubeModal = document.querySelector('#youtube-modal') as HTMLElement;
  const figure = toolbarHTMLTipTapElement.querySelector('#add-figure') as HTMLButtonElement;
  const figureModal = document.querySelector('#figure-modal') as HTMLElement;
  const figcaptionInput = figureModal.querySelector('#figure-figcaption') as HTMLInputElement;
  const figureTitleInput = figureModal.querySelector('#figure-title') as HTMLInputElement;
  const figureAltInput = figureModal.querySelector('#figure-alt') as HTMLInputElement;
  const figureAriaLabelInput = figureModal.querySelector('#figure-aria-label') as HTMLInputElement;
  const figureLoading = figureModal.querySelector('#figure-loading') as HTMLSelectElement;
  const deleteFigure = figureModal.querySelector('#del-figure-img') as HTMLButtonElement;

  figureModal.onsubmit = (e) => e.preventDefault();

  return {
    toolbar: toolbarHTMLTipTapElement,
    bold: toolbarHTMLTipTapElement.querySelector('#bold') as HTMLButtonElement,
    italic: toolbarHTMLTipTapElement.querySelector('#italic') as HTMLButtonElement,
    underline: toolbarHTMLTipTapElement.querySelector('#underline') as HTMLButtonElement,
    strike: toolbarHTMLTipTapElement.querySelector('#strike') as HTMLButtonElement,
    color,
    colorInput: color.querySelector('input'),
    bg,
    bgInput: bg.querySelector('input'),
    leftAlign: toolbarHTMLTipTapElement.querySelector('#align-left') as HTMLButtonElement,
    rightAlign: toolbarHTMLTipTapElement.querySelector('#align-right') as HTMLButtonElement,
    centerAlign: toolbarHTMLTipTapElement.querySelector('#align-center') as HTMLButtonElement,
    justifyAlign: toolbarHTMLTipTapElement.querySelector('#align-justify') as HTMLButtonElement,
    listUl: toolbarHTMLTipTapElement.querySelector('#list-ul') as HTMLButtonElement,
    listOl: toolbarHTMLTipTapElement.querySelector('#list-ol') as HTMLButtonElement,
    indent: toolbarHTMLTipTapElement.querySelector('#indent') as HTMLButtonElement,
    outdent: toolbarHTMLTipTapElement.querySelector('#outdent') as HTMLButtonElement,
    quote: toolbarHTMLTipTapElement.querySelector('#quote') as HTMLButtonElement,
    code: toolbarHTMLTipTapElement.querySelector('#code') as HTMLButtonElement,
    cut: toolbarHTMLTipTapElement.querySelector('#cut') as HTMLButtonElement,
    copy: toolbarHTMLTipTapElement.querySelector('#copy') as HTMLButtonElement,
    paste: toolbarHTMLTipTapElement.querySelector('#paste') as HTMLButtonElement,
    h1: toolbarHTMLTipTapElement.querySelector('#title') as HTMLButtonElement,
    h2: toolbarHTMLTipTapElement.querySelector('#subtitle') as HTMLButtonElement,
    h3: toolbarHTMLTipTapElement.querySelector('#subtitle-3') as HTMLButtonElement,
    superscript: toolbarHTMLTipTapElement.querySelector('#superscript') as HTMLButtonElement,
    subscript: toolbarHTMLTipTapElement.querySelector('#subscript') as HTMLButtonElement,
    link: toolbarHTMLTipTapElement.querySelector('#link') as HTMLButtonElement,
    linkModal,
    linkInput: linkModal.querySelector('#link-href') as HTMLInputElement,
    linkTitleInput,
    linkTitleDad: Array.from(linkModal.querySelectorAll('.mb-3')).find((m3) =>
      m3.contains(linkTitleInput)
    ) as HTMLElement,
    youtube: toolbarHTMLTipTapElement.querySelector('#youtube') as HTMLButtonElement,
    youtubeModal,
    youtubeInput: youtubeModal.querySelector('input'),
    figure,
    figureInput: figure.querySelector('input'),
    configureAndShowFigureModal: (
      _: HTMLElement,
      img: HTMLImageElement,
      figcaption: HTMLElement,
      onDelete: () => void
    ) => {
      figureLoading.value = img.loading ?? 'lazy';
      if (figureModal.dataset.index !== img.id) {
        figcaptionInput.oninput = () => (figcaption.textContent = figcaptionInput.value);
        figureTitleInput.oninput = () => (img.title = figureTitleInput.value);
        figureAltInput.oninput = () => (img.alt = figureAltInput.value);
        figureAriaLabelInput.oninput = () => (img.ariaLabel = figureAriaLabelInput.value);
        figureLoading.oninput = () =>
          (img.loading =
            ['eager', 'lazy'].indexOf(figureLoading.value) >= 0
              ? (figureLoading.value as 'lazy')
              : 'lazy');
        deleteFigure.onclick = () => {
          onDelete();
          hideModal(figureModal);
        };

        figureModal.dataset.index = figure.dataset.id;
      }
      figcaptionInput.value = figcaption.textContent;
      figureTitleInput.value = img.title;
      figureAltInput.value = img.alt;
      figureAriaLabelInput.value = img.ariaLabel ?? '';

      showModal(figureModal);
    },
    fontFamily: toolbarHTMLTipTapElement.querySelector('#font-family') as HTMLSelectElement,
    clean: toolbarHTMLTipTapElement.querySelector('#clean') as HTMLButtonElement,
  };
};
