import { isString } from '@vue/share'
import { Comment, Fragment, Text, VNode } from './vnode'
import { ShapeFlags } from 'packages/share/src/shapeFlags'

export interface RendererOptions {
  // props diff
  patchProp: (el: Element, key: string, preValue: any, nextValue: any) => void
  // 寄主环境dom操作options
  // 创建dom
  createElement: (type: string) => Element
  // 设置文本
  setElementText: (node: Element, text: string) => void
  // 插入
  insert: (el: Element, parent: Element, anchor?: any | null) => void
  // 卸载指定dom
  remove: (el) => void
}

/**
 * 对外暴露的创建渲染器的方法
 */
export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

// 更新和挂载的主要逻辑
function baseCreateRenderer(options: RendererOptions) {
  const {
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    insert: hostInsert,
    remove: hostRemove
  } = options

  /**
   *
   * @param oldVNode 旧节点，如果为null这表示第一次挂载
   * @param newVNode 新节点
   * @param el 挂载dom
   */
  function patch(
    oldVNode: VNode | null,
    newVNode: VNode,
    container,
    anchor = null
  ) {
    // 两节点相同
    if (oldVNode === newVNode) return

    // 开始区分不同节点
    const { type, shapeFlag } = newVNode

    switch (type) {
      case Comment:
        // TODO: patchComment
        break
      case Fragment:
        // TODO: patchFragment
        break
      case Text:
        // TODO: patchText
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 挂载dom元素
          processElement(oldVNode, newVNode, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 组件
          processComponent(oldVNode, newVNode, container, anchor)
        }
    }
  }

  /**
   * 元素处理
   */
  function processElement(n1: VNode | null, n2: VNode, container, anchor) {
    if (n1 == null) {
      // 挂载
      mountElement(n2, container, anchor)
    } else {
      // patch diff
    }
  }

  /**
   * 元素挂载
   */
  function mountElement(vnode: VNode, container, anchor) {
    // 挂载
    const { type, props, children, shapeFlag } = vnode
    // 创建节点
    const el = (container.el = hostCreateElement(type))
    // 处理孩子是数组
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // TODO: mountChildren
    } else {
      // 处理文本
      hostSetElementText(el, children)
    }

    // 处理props
    for (let key in props) {
      hostPatchProp(el, key, null, props[key])
    }

    // 插入元素
    hostInsert(el, container, anchor)
  }

  /**
   * 组件处理
   */
  function processComponent(n1: VNode | null, n2: VNode, container, anchor) {}

  const render = (vnode: VNode, container) => {
    if (vnode == null) {
      // TODO: 卸载
    } else {
      // 打补丁patch / mount
      patch(container._vnode, vnode, container)
    }
    // 将当前vnode赋值给container._vnode作为旧节点
    container._vnode = vnode
  }

  return {
    render
  }
}
