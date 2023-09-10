import { isOn } from '@vue/share'
import { patchClass } from './modules/patchClass'

// 只处理单种props，在外层遍历
export function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    // TODO: 处理class
    patchClass(el, nextValue)
  } else if (key === 'style') {
    // TODO: 处理style
  } else if (isOn(key)) {
    // TODO: 处理事件
  }
}
