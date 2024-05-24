import { forbidden } from '../../utilities/forbidden';
import { tools } from '../../utilities/tools';

export async function uploadBlob(blob: Blob, slug: string) {
  const { toaster } = tools();
  const body = new FormData();
  body.set('blob', blob);
  const response = await fetch(`/api/article/${slug}/blob`, {
    method: 'POST',
    body,
    credentials: 'same-origin',
  });
  if (response.status === 403) {
    forbidden();
    return null;
  }
  if (!response.ok) {
    const { message } = await response.json();
    toaster.danger(message);
    return null;
  }
  const data = await response.json();
  return { url: data.url as string, id: data.id as string };
}
