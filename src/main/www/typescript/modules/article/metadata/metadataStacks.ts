import { hideModal, showModal } from '../../../libs/Bulma';
import { forbidden } from '../../../utilities/forbidden';
import { generateHTML } from '../../../utilities/generateHtml';
import { tools } from '../../../utilities/tools';

export function metadataStacks(slug: string) {
  const form = document.querySelector('form#add-stack') as HTMLFormElement;
  const createStackModal = document.getElementById('modal-create-stack') as HTMLFormElement;

  listenCreateStackModal(createStackModal, slug);

  form
    .querySelector<HTMLElement>('#create-stack')
    .addEventListener('click', () => showModal(createStackModal));
}

async function listenCreateStackModal(form: HTMLFormElement, slug: string) {
  const { anim, toaster, screenProgress } = tools();
  const stackTable = document.querySelector('table#stack-tb') as HTMLTableElement;
  const nameInput = form.querySelector('#stack-name') as HTMLInputElement;
  const descriptionInput = form.querySelector('#stack-description') as HTMLTextAreaElement;
  const descriptionHelper = form.querySelector('.description-len');
  const descriptionMaxLen = 160;

  const successMessage = form.dataset.message;

  nameInput.addEventListener('input', () => {
    if (nameInput.value.length > 100 || nameInput.value.trim().length < 1)
      nameInput.classList.add('is-danger');
    else nameInput.classList.remove('is-danger');
  });

  descriptionInput.addEventListener('input', () => {
    const len = descriptionInput.value.length;
    if (len > descriptionMaxLen) descriptionInput.classList.add('is-danger');
    else descriptionInput.classList.remove('is-danger');
    descriptionHelper.textContent = String(descriptionMaxLen - len);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (name.length < 1 || name.length > 100) {
      anim.shake(nameInput);
      return;
    }
    const description = descriptionInput.value.trim();
    if (description.length > descriptionMaxLen) {
      anim.shake(descriptionInput);
      return;
    }

    screenProgress.show();
    try {
      const response = await fetch('/api/stack?article=' + slug, {
        method: 'POST',
        body: JSON.stringify({ name, description }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });
      if (response.status === 403) return forbidden();
      if (!response.ok) {
        const { message } = await response.json();
        toaster.danger(message);
        return;
      }
      const stack = (await response.json()) as Stack;
      const tr = generateTableRow(stack);
      stackTable.tBodies[0].appendChild(tr);
      stackTable.tBodies[0].querySelector('#no-stack')?.remove();
      hideModal(form);
      toaster.info(successMessage);
    } catch (error) {
      console.log(error);
      toaster.danger();
    } finally {
      screenProgress.hide();
    }
  });
}

function generateTableRow(stack: Stack) {
  return generateHTML({
    htmlType: 'tr',
    attributes: [{ key: 'title', value: stack.name }],
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
            onClick: () => console.log('clicked at', stack),
          },
        ],
      },
    ],
  });
}
