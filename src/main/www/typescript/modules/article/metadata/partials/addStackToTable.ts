import { forbidden } from '../../../../utilities/forbidden';
import { generateHTML } from '../../../../utilities/generateHtml';
import { tools } from '../../../../utilities/tools';
import { onClickRemoveStack, stackTable } from '../metadataStacks';

export function addStackToTable(stack: Stack) {
  const tr = generateTableRow(stack);
  stackTable.tBodies[0].appendChild(tr);
  stackTable.tBodies[0].querySelector('#no-stack')?.remove();
}

export async function removeStackFromArticle(stack: string, slug: string) {
  const { toaster, screenProgress } = tools();
  screenProgress.show();
  try {
    const response = await fetch(`/api/article/${slug}/stack`, {
      body: JSON.stringify({ stack }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      method: 'DELETE',
    });
    if (response.status === 403) return forbidden();
    if (!response.ok) {
      const { message } = await response.json();
      toaster.danger(message);
      return;
    }
    stackTable.querySelector(`tr[title="${stack}"]`)?.remove();
  } catch (error) {
    console.log(error);
    toaster.danger();
  } finally {
    screenProgress.hide();
  }
}

function generateTableRow(stack: Stack) {
  return generateHTML({
    htmlType: 'tr',
    attributes: [
      { key: 'title', value: stack.name },
      { key: 'data-stack', value: stack.name },
    ],
    children: [
      {
        htmlType: 'td',
        attributes: [{ key: 'class', value: 'has-text-centered' }],
        children: [
          {
            htmlType: 'a',
            attributes: [
              { key: 'target', value: '_blank' },
              { key: 'rel', value: 'noopener noreferrer' },
              { key: 'href', value: '/stack/' + stack.name },
            ],
            value: stack.name,
          },
        ],
      },
      {
        htmlType: 'td',
        attributes: [{ key: 'class', value: 'has-text-centered' }],
        value: stack.description,
      },
      {
        htmlType: 'td',
        attributes: [{ key: 'class', value: 'has-text-centered' }],
        children: [
          {
            htmlType: 'button',
            attributes: [
              { key: 'class', value: 'button is-small is-danger remove-stack' },
              { key: 'data-stack', value: stack.name },
              { key: 'type', value: 'button' },
            ],
            children: [
              {
                htmlType: 'i',
                attributes: [{ key: 'class', value: 'fa-solid fa-trash-arrow-up' }],
              },
            ],
            onClick: (button) => onClickRemoveStack(button as HTMLButtonElement),
          },
        ],
      },
    ],
  });
}
