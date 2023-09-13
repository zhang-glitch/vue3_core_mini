import { Text, createVNode } from './vnode'

export function normalizeVNode(child) {
  if (typeof child === 'object') {
    // 当前为vnode
    return child
  } else {
    return createVNode(Text, null, child)
  }
}
