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

export const extensions = [
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
];
