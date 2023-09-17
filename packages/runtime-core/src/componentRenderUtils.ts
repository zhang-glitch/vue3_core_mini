import { ShapeFlags } from 'packages/share/src/shapeFlags'
import { Text, createVNode } from './vnode'

export function normalizeVNode(child) {
  if (typeof child === 'object') {
    // 当前为vnode
    return child
  } else {
    return createVNode(Text, null, child)
  }
}

/**
 * 生成组件vnode
 */

export function renderComponentRoot(instance) {
  const { vnode, render, data } = instance
  let result
  try {
    // 解析到状态组件
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      // 改变render函数this指向。
      result = normalizeVNode(render!.call(data, data))
    }
  } catch (error) {
    console.error(error)
  }
  return result
}
