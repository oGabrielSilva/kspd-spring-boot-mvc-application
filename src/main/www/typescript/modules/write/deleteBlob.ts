import { forbidden } from '../../utilities/forbidden';
import { tools } from '../../utilities/tools';

export async function deleteBlob(nanoId: string, slug: string) {
  const { toaster, screenProgress } = tools();
  screenProgress.show();
  try {
    const response = await fetch(`/api/articles/${slug}/${nanoId}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 403) {
      forbidden();
      return false;
    }
    if (!response.ok) {
      const { message } = await response.json();
      toaster.danger(message);
      return false;
    }
    return true;
  } catch (error) {
    toaster.danger();
    console.log(error);
    return false;
  } finally {
    screenProgress.hide();
  }
}
