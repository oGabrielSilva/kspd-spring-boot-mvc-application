import { Node, mergeAttributes } from '@tiptap/core';

const Figure = Node.create({
  name: 'figure',

  group: 'block',

  content: 'image figcaption',

  addAttributes() {
    return {
      'data-id': {
        default: null,
      },
      contenteditable: {
        default: 'false',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes), 0];
  },
});

const Figcaption = Node.create({
  name: 'figcaption',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'figcaption',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figcaption', mergeAttributes(HTMLAttributes), 0];
  },
});

const FigureImage = Node.create({
  name: 'image',

  group: 'block',

  draggable: false,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      id: {
        default: null,
      },
      'aria-label': {
        default: null,
      },
      loading: {
        default: 'lazy',
      },
      draggable: {
        default: 'false',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },
});

export { Figure, Figcaption, FigureImage };
