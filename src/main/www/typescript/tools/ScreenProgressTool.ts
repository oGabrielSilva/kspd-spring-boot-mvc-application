import { generateHTML } from '../utilities/generateHtml';

export class ScreenProgressTool {
    private static tool: ScreenProgressTool;

    private readonly screenProgressID = 'progress-view-container';
    private readonly barClassName = 'bar';
    private readonly bar2ClassName = 'bar2';
    private readonly view = generateHTML<HTMLDivElement>({
        htmlType: 'div',
        attributes: [{ key: 'id', value: this.screenProgressID }],
        children: [
            { htmlType: 'div', attributes: [{ key: 'class', value: this.barClassName }] },
            { htmlType: 'div', attributes: [{ key: 'class', value: this.bar2ClassName }] },
        ],
    });

    private isVisible = false;

    private constructor() { }

    public show() {
        if (this.isVisible || !this.view) return;
        this.isVisible = true;
        document.body.appendChild(this.view);
    }

    public hide() {
        if (!this.view) return;
        this.isVisible = false;
        this.view.remove();
    }

    public onScreen() {
        return this.isVisible;
    }

    public static get() {
        if (!ScreenProgressTool.tool) {
            ScreenProgressTool.tool = new ScreenProgressTool();
            const searchStyle = document.querySelector('style.screen-progress-tool')
            if (!searchStyle) {
                document.head.appendChild(generateHTML<HTMLStyleElement>({
                    htmlType: "style",
                    attributes: [{ key: "class", value: "screen-progress-tool" }],
                    value: `
                    #progress-view-container {
                        width: 100vw;
                        height: 100vh;
                        position: fixed;
                        top: 0;
                        left: 0;
                        background: rgba(0, 0, 0, 0.8);
                        z-index: 98;
                    }

                    .bar,
                    .bar2 {
                        width: 35%;
                        border: 1px solid #99bcfe;
                        position: absolute;
                        left: -35%;
                        top: 0;
                        animation: kf-bar 1500ms ease infinite;
                    }

                    .bar2 {
                        animation-duration: 1000ms;
                    }`
                })!)
            }
        }
        return ScreenProgressTool.tool;
    }
}