/* Allow-list sanitizer for PocketBase "editor" fields.
   Keeps basic formatting only; drops scripts, styles, event handlers and
   any link that is not http(s)/mailto. Browser-only (uses DOMParser). */

const ALLOWED_TAGS = new Set([
  'P', 'BR', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'U', 'S',
  'H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'SPAN', 'A',
]);
const DROPPED_WITH_CONTENT = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT']);

function clean(node: Node, doc: Document): Node[] {
  if (node.nodeType === Node.TEXT_NODE) return [doc.createTextNode(node.textContent ?? '')];
  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const el = node as Element;
  if (DROPPED_WITH_CONTENT.has(el.tagName)) return [];

  const children = Array.from(el.childNodes).flatMap((child) => clean(child, doc));
  if (!ALLOWED_TAGS.has(el.tagName)) return children; // unwrap unknown tags, keep their text

  const out = doc.createElement(el.tagName.toLowerCase());
  if (el.tagName === 'A') {
    const href = el.getAttribute('href') ?? '';
    if (/^(https?:|mailto:)/i.test(href.trim())) {
      out.setAttribute('href', href.trim());
      out.setAttribute('target', '_blank');
      out.setAttribute('rel', 'noopener noreferrer');
    }
  }
  children.forEach((child) => out.appendChild(child));
  return [out];
}

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined' || !html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const container = doc.createElement('div');
  Array.from(doc.body.childNodes)
    .flatMap((child) => clean(child, doc))
    .forEach((child) => container.appendChild(child));
  return container.innerHTML;
}
