interface Attr {
    key: string;
    value: string;
}

interface HTML {
    htmlType: string;
    attributes?: Array<Attr>;
    children?: Array<HTML>;
    value?: string;
    // eslint-disable-next-line no-unused-vars
    onClick?: (target: HTMLElement) => void;
}

function generate({ htmlType, attributes, value, onClick, children }: HTML) {
    const html = document.createElement(htmlType);
    if (attributes) attributes.forEach((attr) => html.setAttribute(attr.key, attr.value));
    if (onClick) html.onclick = () => onClick(html);
    if (children) {
        children.forEach((child) => {
            const c = generate(child);
            html.appendChild(c);
        });
    }
    if (value) html.textContent = value;
    return html;
}

/**
 *
 * @deprecated
 */
export function generateHTML<T>({ attributes, value, htmlType, onClick, children }: HTML) {
    if (typeof document !== 'object') return null;
    const html = generate({ htmlType, attributes, onClick });
    if (children) {
        children.forEach((child) => {
            const c = generate(child);
            html.appendChild(c);
        });
    }
    if (value) html.textContent = value;
    return html as T;
}