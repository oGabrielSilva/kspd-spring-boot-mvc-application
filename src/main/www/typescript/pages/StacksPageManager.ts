import { StackEditForm } from '../modules/stack/StackEditForm';
import { StackForm } from '../modules/stack/StackForm';

export class StacksPageManager {
  private readonly buttonOpenStackForm = document.querySelector('#button-open-stack-form');
  private readonly stackForm;
  private readonly stackEditForm = new StackEditForm();
  private readonly listOfEditStackButton = document.querySelectorAll('button[data-edit].isMod');

  constructor() {
    this.stackForm = StackForm.canRunIt() ? new StackForm() : null;
  }

  private listenOnButtonOpenStackFormClicked() {
    this.buttonOpenStackForm.addEventListener('click', () => this.stackForm.show());
  }

  private configureStackForm() {
    if (this.stackForm) {
      this.stackForm.onCreate = () => window.location.reload();
      this.stackForm.listen();
    }
  }

  private configureEditStackForm() {
    this.stackEditForm.configureForm();

    this.stackEditForm.onUpdate = (stack, oldStack) => {
      const stackArea = document.querySelector<HTMLElement>(
        `section[data-section-stack="${oldStack.name}"]`
      );
      stackArea.dataset.sectionStack = stack.name;
      stackArea.querySelector('h2').textContent = stack.name;
      stackArea.querySelector('p').textContent = stack.description;
      stackArea.querySelector('a').href = encodeURI(`/stack/${stack.name}`);
      stackArea.querySelector<HTMLElement>('button.isMod').dataset.stack = stack.name;

      listOfStacks.forEach((st, i) => {
        if (st.name === oldStack.name) {
          listOfStacks[i].name = stack.name;
          listOfStacks[i].description = stack.description;
        }
      });
    };
  }

  private listenOnEditButtonClicked() {
    ((this.listOfEditStackButton || []) as NodeListOf<HTMLButtonElement>).forEach((button) => {
      button.onclick = () => {
        const stackName = button.dataset.stack;
        const stack = listOfStacks.find(({ name }) => name === stackName);
        if (!stack) return;
        this.stackEditForm.attachStack(stack).showForm();
      };
    });
  }

  public run(isModerator: boolean) {
    this.configureStackForm();
    if (StackForm.canRunIt()) this.listenOnButtonOpenStackFormClicked();

    if (isModerator) {
      this.configureEditStackForm();
      this.listenOnEditButtonClicked();
    }
  }

  public static get instance() {
    return new StacksPageManager();
  }
}

declare global {
  const listOfStacks: Stack[];
}
