/**
 * SEC-11: Sanitização básica de HTML para prevenir XSS.
 * Remove tags <script>, atributos de evento (on*) e URIs javascript:.
 * Não substitui uma biblioteca dedicada (DOMPurify) em produção com
 * conteúdo não confiável de terceiros, mas contém os vetores principais.
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return ''
  const div = document.createElement('div')
  div.innerHTML = html

  // Remove tags <script> e seu conteúdo
  div.querySelectorAll('script').forEach((el) => el.remove())

  // Remove elementos com tag perigosas
  div.querySelectorAll('iframe, object, embed, link[rel="import"]').forEach((el) => el.remove())

  // Remove atributos de evento (on*) e href/src com javascript:
  div.querySelectorAll('*').forEach((el) => {
    // Remove atributos on*
    for (const attr of [...el.attributes]) {
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name)
      }
      // Bloqueia URIs javascript: e data: em href/src
      if (['href', 'src', 'action', 'formaction', 'xlink:href'].includes(attr.name.toLowerCase())) {
        const val = attr.value.trim().toLowerCase()
        if (val.startsWith('javascript:') || val.startsWith('data:text/html')) {
          el.removeAttribute(attr.name)
        }
      }
    }
  })

  return div.innerHTML
}
