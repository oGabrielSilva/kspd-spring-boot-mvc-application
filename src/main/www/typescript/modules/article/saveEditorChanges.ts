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
  const data = {
    ...(title && title !== originalTitle ? { title } : {}),
    ...(originalContent !== content ? { content } : {}),
  } as Article;

  if (slugElement.value !== originalSlug) {
    const slug = slugElement.value;
    data.slug = slug;
    const ctt = data.content ? data.content : editor.getHTML();
    data.content = ctt.replace(new RegExp(`/article/${originalSlug}`, 'g'), `/article/${slug}`);
  }

  const contentHTML = document.createElement('div');
  contentHTML.innerHTML = data.content ? data.content : editor.getHTML();
  let contentChanged = false;

  contentHTML.querySelectorAll('img')?.forEach((img) => {
    const originalImg = editor.view.dom.querySelector<HTMLImageElement>('#' + img.id);
    if (!originalImg) return;
    if (img.alt !== originalImg.alt) {
      img.alt = originalImg.alt;
      contentChanged = true;
    }
    if (img.title !== originalImg.title) {
      img.title = originalImg.title;
      contentChanged = true;
    }
    if (img.ariaLabel !== originalImg.ariaLabel) {
      img.ariaLabel = originalImg.ariaLabel;
      contentChanged = true;
    }
    if (img.loading !== originalImg.loading) {
      img.loading = originalImg.loading;
      contentChanged = true;
    }
  });
  if (contentChanged) data.content = contentHTML.innerHTML;

  if (!Object.keys(data).length) return;
  const response = await fetch('/api/article/' + originalSlug, {
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
    window.onbeforeunload = () => {};
    window.location.href = '/' + result.slug + '/edit';
  }
}
