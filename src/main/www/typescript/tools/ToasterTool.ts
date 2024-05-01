import { generateHTML } from '../utilities/generateHtml';
import { AnimationTool } from './AnimationTool';

type IconType = 'bootstrap' | 'font-awesome';

interface Theme {
  icon: string;
  backdrop: string;
  color: string;
}

export class ToasterTool {
  private static tool: ToasterTool;

  private readonly anim;

  get animator() {
    return this.anim;
  }

  private readonly events: Array<NodeJS.Timeout> = [];
  private readonly toasterID = 'toaster';
  private toaster: HTMLDivElement | null = null;
  private toasterText: HTMLSpanElement | null = null;
  private toasterIcon: HTMLElement | null = null;
  private toasterProgress: HTMLElement | null = null;
  private styleWithAnim: HTMLStyleElement | null = null;
  private toasterInScreen = false;

  private readonly animationClass = 'ex-anim-progress-bar';
  private readonly animationKeyframePropertyName = 'kf-anim-progress-bar';
  private readonly themes = {
    info: {
      icon: 'bi bi-info-circle',
      backdrop: '#3c48af',
      color: '#ffffff',
    } as Theme,
    danger: {
      icon: 'bi bi-exclamation-diamond',
      backdrop: '#ca4141',
      color: '#f7f8f8',
    } as Theme,
    alert: {
      icon: 'bi bi-question-diamond',
      backdrop: '#d1c717',
      color: '#1c2003',
    } as Theme,
    success: {
      icon: 'bi bi-check2-circle',
      backdrop: '#3dbe41',
      color: '#f9f9f9',
    } as Theme,
  };

  private afterFunction?: () => void = void 0;

  private constructor(anim: AnimationTool) {
    this.anim = anim;
  }

  private generate() {
    this.toaster = generateHTML({
      htmlType: 'div',
      attributes: [{ key: 'id', value: this.toasterID }],
      children: [
        {
          htmlType: 'div',
          attributes: [{ key: 'class', value: 'toaster-content' }],
          children: [
            {
              htmlType: 'i',
              attributes: [{ key: 'class', value: 'bi bi-info-circle' }],
            },
            { htmlType: 'span' },
          ],
        },
        {
          htmlType: 'div',
          attributes: [{ key: 'class', value: 'toaster-progress ' + this.animationClass }],
        },
      ],
    });
    if (!this.toaster) return;
    this.styleWithAnim = document.createElement('style');
    this.toasterText = this.toaster!.querySelector('span');
    this.toasterIcon = this.toaster!.querySelector('i');
    this.toasterProgress = this.toaster!.querySelector('.toaster-progress');
    document.head.appendChild(this.styleWithAnim);
    this.toaster!.onclick = () => {
      this.hide();
    };

    const searchStyle = document.querySelector('style.toaster-tool');
    if (!searchStyle) {
      document.head.appendChild(
        generateHTML<HTMLStyleElement>({
          htmlType: 'style',
          attributes: [{ key: 'class', value: 'toaster-tool' }],
          value: `
                    #toaster, #toaster * {
                      transition: all 400ms ease-in-out;
                    }

                    #toaster {
                      position: fixed;
                      top: 5vh;
                      right: 5vw;
                      background: var(--danger);
                      z-index: 9999;
                      max-width: 80vw;
                      min-width: 40vw;
                      cursor: pointer;
                      overflow: hidden;
                      border-radius: 4px;
                    }

                    #toaster .toaster-content {
                      padding: 1rem 1rem calc(1rem - 4px) 1rem;
                      display: flex;
                      align-items: center;
                      gap: 1rem;
                    }

                    #toaster .toaster-progress {
                      border: 2px solid #ffffff;
                    }

                    #toaster i,
                    #toaster span {
                      color: var(--text-on-danger);
                      font-weight: 500;
                    }

                    #toaster i {
                      font-size: 1.2rem;
                    }`,
        })!
      );
    }
  }

  private updateStyle(timer: number) {
    this.styleWithAnim!.innerHTML = `
    .${this.animationClass} {
      animation: ${this.animationKeyframePropertyName} ${timer}ms ease;
    }

    @keyframes ${this.animationKeyframePropertyName} {
      to {
        transform: translateX(-100%);
      }
    }
    `;
  }

  private updateTheme({ backdrop, color, icon }: Theme) {
    this.toasterIcon!.className = '';
    this.toasterIcon!.setAttribute('class', icon);
    this.toaster?.style.setProperty('background', backdrop);
    this.toasterIcon?.style.setProperty('color', color);
    this.toasterText?.style.setProperty('color', color);
  }

  private show(timer: number) {
    if (this.toasterInScreen) {
      this.hide().then(() => this.show(timer));
      return;
    }
    this.toaster!.style.scale = '0';
    this.toasterInScreen = true;
    this.toasterProgress!.style.transform = '';
    document.body.appendChild(this.toaster!);
    this.events.push(setTimeout(() => this.anim.scaleIn(this.toaster!), 100));
    this.events.push(
      setTimeout(() => (this.toasterProgress!.style.transform = 'translateX(-100%)'), timer - 10)
    );
  }

  public async hide() {
    return new Promise((r) => {
      try {
        this.events.forEach((e) => clearTimeout(e));
        this.anim.scaleOut(this.toaster!, () => {
          this.toaster?.remove();
          this.toasterInScreen = false;
          r(true);
        });
      } catch (error) {
        console.error(error);
        r(false);
      } finally {
        if (typeof this.afterFunction === 'function') this.afterFunction();
        this.afterFunction = void 0;
      }
    });
  }

  public addAfterFunction(func: () => void) {
    this.afterFunction = func;
    return this;
  }

  public info(message?: string, timerInMilliseconds = 6000) {
    this.updateStyle(timerInMilliseconds);
    this.updateTheme(this.themes.info);
    this.toasterText!.textContent = message ? message : '';
    this.show(timerInMilliseconds);
    this.events.push(setTimeout(() => this.hide(), timerInMilliseconds));
  }

  public alert(message?: string, timerInMilliseconds = 6000) {
    this.updateStyle(timerInMilliseconds);
    this.updateTheme(this.themes.alert);
    this.toasterText!.textContent = message ? message : '';
    this.show(timerInMilliseconds);
    this.events.push(setTimeout(() => this.hide(), timerInMilliseconds));
  }

  public success(message?: string, timerInMilliseconds = 6000) {
    this.updateStyle(timerInMilliseconds);
    this.updateTheme(this.themes.success);
    this.toasterText!.textContent = message ? message : '';
    this.show(timerInMilliseconds);
    this.events.push(setTimeout(() => this.hide(), timerInMilliseconds));
  }

  public danger(message?: string, timerInMilliseconds = 6000) {
    this.updateStyle(timerInMilliseconds);
    this.updateTheme(this.themes.danger);
    this.toasterText!.textContent = message ? message : 'Error... :(';
    this.show(timerInMilliseconds);
    this.events.push(setTimeout(() => this.hide(), timerInMilliseconds));
  }

  /**
   *
   * @deprecated
   */
  public getAnimator() {
    return this.anim;
  }

  public static get(anim?: AnimationTool) {
    if (!ToasterTool.tool) {
      if (!anim) anim = AnimationTool.get();
      ToasterTool.tool = new ToasterTool(anim);
      ToasterTool.tool.generate();
    }
    return ToasterTool.tool;
  }
}
