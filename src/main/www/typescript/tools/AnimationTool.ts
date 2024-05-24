import { generateHTML } from '../utilities/generateHtml';

export class AnimationTool {
  private static anim: AnimationTool;

  private readonly shakeClass = 'animated-by-shake';

  private constructor() {}

  public scaleIn(element: HTMLElement, onComplete?: () => void) {
    element.style.scale = '1.1';
    setTimeout(() => {
      element.style.scale = '';
      if (onComplete) setTimeout(() => onComplete(), 400);
    }, 400);
  }

  public scaleOut(element: HTMLElement, onComplete?: () => void) {
    element.style.scale = '1.1';
    setTimeout(() => {
      element.style.scale = '0';
      if (onComplete) setTimeout(() => onComplete(), 400);
    }, 100);
  }

  public shake(element: HTMLElement, getFocus = true, timer = 400) {
    if (element.classList.contains(this.shakeClass)) {
      element.classList.remove(this.shakeClass);
    }
    if (getFocus) element.focus();
    setTimeout(() => {
      element.classList.add(this.shakeClass);
      setTimeout(() => element.classList.remove(this.shakeClass), timer);
    }, 100);
  }

  public shakeAll(elements: Array<HTMLElement>, focusAt: HTMLElement = null, timer = 400) {
    elements.forEach((element) => {
      if (element.classList.contains(this.shakeClass)) {
        element.classList.remove(this.shakeClass);
      }
      if (focusAt === element) element.focus();
      setTimeout(() => {
        element.classList.add(this.shakeClass);
        setTimeout(() => element.classList.remove(this.shakeClass), timer);
      }, 100);
    });
  }

  public static get() {
    if (!AnimationTool.anim) {
      AnimationTool.anim = new AnimationTool();
      const searchStyle = document.querySelector('style.animation-tool');
      if (!searchStyle) {
        document.head.appendChild(
          generateHTML<HTMLStyleElement>({
            htmlType: 'style',
            attributes: [{ key: 'class', value: 'animation-tool' }],
            value: `
                    .animated-by-shake {
                      animation: kf-shake 100ms ease-in-out infinite;
                    }

                    @keyframes kf-shake {
                      from {
                        transform: translateX(-10px);
                      }
                      to {
                        transform: translateX(10px);
                      }
                    }

                    @keyframes kf-bar {
                      to {
                        transform: translateX(calc(100vw + 100%));
                      }
                    }`,
          })!
        );
      }
    }
    return AnimationTool.anim;
  }
}
