import { isOn } from '@vue/share'
import { patchClass } from './modules/patchClass'
import { patchDomProp } from './modules/patchDomProp'
import { patchAttr } from './modules/patchAttr'
import { patchStyle } from './modules/patchStyle'
import { patchEvent } from './modules/patchEvent'

// 只处理单种props，在外层遍历
export function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    // TODO: 处理class
    patchClass(el, nextValue)
  } else if (key === 'style') {
    // TODO: 处理style
    patchStyle(el, prevValue, nextValue)
  } else if (isOn(key)) {
    // TODO: 处理事件
    patchEvent(el, key, prevValue, nextValue)
  } else if (shouldSetAsProp(el, key)) {
    // dom对象属性
    patchDomProp(el, key, nextValue)
  } else {
    // 其他属性
    patchAttr(el, key, nextValue)
  }
}

function shouldSetAsProp(el, key) {
  if (key === 'form') return false

  if (key === 'type' && el.tagName === 'TEXTAREA') return false

  if (key === 'list' && el.tagName === 'INPUT') return false

  return key in el
}
