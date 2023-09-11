import { isString } from '@vue/share'
export function patchStyle(el: Element, prevValue, nextValue) {
  const style = (el as HTMLElement).style!
  // 判断当前vnod style是否是字符串
  const isCssString = isString(nextValue)
  if (nextValue && !isCssString) {
    for (let key in nextValue) {
      setStyle(style, key, nextValue[key])
    }

    // 移除不存在的style
    if (prevValue && !isString(prevValue)) {
      for (let key in prevValue) {
        if (!(key in nextValue)) {
          setStyle(style, key, '')
        }
      }
    }
  } else {
    if (isCssString) {
      if (prevValue !== nextValue) {
        style.cssText = nextValue as string
      }
    } else if (prevValue) {
      el.removeAttribute('style')
    }
  }
}

function setStyle(style: CSSStyleDeclaration, name: string, val: string) {
  style[name] = val
}
