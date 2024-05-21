import type { Editor } from '@tiptap/core';
import { forbidden } from '../../utilities/forbidden';
import { tools } from '../../utilities/tools';

export async function saveEditorChanges(
  editor: Editor,
  titleElement: HTMLInputElement,
  slugElement: HTMLInputElement,
  originalSlug: string
) {
  const { toaster } = tools();
  const originalTitle = titleElement.dataset.original;
  const originalContent = (editor.options.element as HTMLElement).dataset.content;

  const content = editor.getHTML();
  const title = titleElement.value;
  const newSlug = slugElement.value;
  const data = {
    ...(content !== originalContent ? { content } : {}),
    ...(title && title !== originalTitle ? { title } : {}),
    ...(newSlug && originalSlug !== newSlug ? { slug: newSlug } : {}),
  };

  if (!Object.keys(data).length) return;
  const response = await fetch('/api/articles/' + originalSlug, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  });
  if (response.status === 403) return forbidden();
  if (!response.ok) {
    const { message } = await response.json();
    toaster.danger(message);
    return;
  }
  toaster.success((editor.options.element as HTMLElement).dataset.save);
  if (response.status === 204) return;
  const result = (await response.json()) as Article;
  if (result.slug !== originalSlug) {
    window.location.href = '/' + result.slug + '/edit';
  }
}
