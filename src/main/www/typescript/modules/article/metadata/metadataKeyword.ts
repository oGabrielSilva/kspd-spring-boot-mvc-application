import { forbidden } from '../../../utilities/forbidden';
import { generateHTML } from '../../../utilities/generateHtml';
import { tools } from '../../../utilities/tools';
import { ArticleValidation } from '../../../validations/ArticleValidation';

let keywordTagContainer: HTMLElement;
let artSlug: string;
let savedKeywords: string[];
let countKeywords: HTMLElement;

export function metadataKeyword(slug: string, keywordForm: HTMLFormElement) {
  const { extractKeywords } = new ArticleValidation();
  const { anim, toaster, screenProgress } = tools();

  artSlug = slug;
  keywordTagContainer = keywordForm.querySelector('div#keyword-tag');
  savedKeywords = Array.from(
    document.querySelectorAll<HTMLSpanElement>('span.keyword-presentation')
  ).map((span) => span.dataset.keyword as string);
  countKeywords = keywordForm.querySelector('#keywords-count') as HTMLElement;

  const keywordInput = keywordForm.querySelector('input#keywords') as HTMLInputElement;

  keywordInput.addEventListener('input', () => {
    if (keywordInput.value.length < 1) keywordInput.classList.add('is-danger');
    else keywordInput.classList.remove('is-danger');
    const count = savedKeywords.length + extractKeywords(keywordInput.value, savedKeywords).length;
    countKeywords.textContent = String(count);
    if (count > 20) keywordInput.classList.add('is-danger');
  });

  keywordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (keywordInput.value.length < 1) {
      anim.shakeAll(
        [keywordInput, keywordForm.querySelector('button[type="submit"]')],
        keywordInput
      );
      keywordInput.classList.add('is-danger');
      return;
    }
    const keywords = extractKeywords(keywordInput.value, savedKeywords);

    if (keywords.length > 20) {
      anim.shakeAll(
        [keywordInput, keywordForm.querySelector('button[type="submit"]')],
        keywordInput
      );
      keywordInput.classList.add('is-danger');
      return;
    }

    screenProgress.show();

    try {
      const response = await fetch('/api/article/' + slug + '/keywords', {
        method: 'PATCH',
        body: JSON.stringify({ keywords: keywords }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return;
      }
      keywordInput.value = '';
      const { saved, keywords: keywordsApi } = (await response.json()) as {
        saved: string[];
        keywords: string[];
      };
      savedKeywords = keywordsApi;
      updateTags();

      const msg = keywordInput.dataset.message + saved.join(', ');
      toaster.success(msg);
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  });

  keywordTagContainer.querySelectorAll('button').forEach(
    (b) =>
      (b.onclick = () => {
        if (b.dataset.clicked === 'true') {
          b.dataset.clicked = 'false';
          onTagDelete(b.dataset.value);
        } else {
          b.dataset.clicked = 'true';
          b.classList.add('is-danger');
          setTimeout(() => {
            b.dataset.clicked = 'false';
            b.classList.remove('is-danger');
          }, 2000);
        }
      })
  );
}

function updateTags() {
  countKeywords.textContent = String(savedKeywords.length);
  keywordTagContainer.innerHTML = '';
  savedKeywords.forEach((key) => {
    const html = generateHTML({
      htmlType: 'div',
      attributes: [{ key: 'class', value: 'mb-0 tags has-addons' }],
      children: [
        {
          htmlType: 'span',
          attributes: [
            { key: 'class', value: 'keyword-presentation tag' },
            { key: 'data-keyword', value: key },
          ],
          value: key,
        },
        {
          htmlType: 'button',
          attributes: [
            { key: 'class', value: 'tag is-delete' },
            { key: 'data-value', value: key },
            { key: 'type', value: 'button' },
          ],
          onClick: (e) => {
            if (e.dataset.clicked === 'true') {
              e.dataset.clicked = 'false';
              onTagDelete(key);
            } else {
              e.dataset.clicked = 'true';
              e.classList.add('is-danger');
              setTimeout(() => {
                e.dataset.clicked = 'false';
                e.classList.remove('is-danger');
              }, 2000);
            }
          },
        },
      ],
    });
    keywordTagContainer.appendChild(html);
  });
}

async function onTagDelete(keyword: string) {
  const { toaster, screenProgress } = tools();
  screenProgress.show();
  try {
    const response = await fetch(`/api/article/${artSlug}/keyword/${keyword}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    });
    if (response.status === 403) return forbidden();
    if (!response.ok) {
      const { message } = await response.json();
      toaster.danger(message);
      return;
    }
    savedKeywords = savedKeywords.filter((key) => key !== keyword);
    updateTags();
  } catch (error) {
    console.log(error);
    toaster.danger();
  } finally {
    screenProgress.hide();
  }
}
