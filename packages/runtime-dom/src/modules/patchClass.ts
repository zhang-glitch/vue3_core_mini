/**
 * patch class
 */
export function patchClass(el: Element, nextValue) {
  if (nextValue == null) {
    el.setAttribute('class', '')
  } else {
    el.className = nextValue
  }
}
