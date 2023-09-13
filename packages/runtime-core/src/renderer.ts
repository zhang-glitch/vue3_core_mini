import { EMPTY_OBJ, isString } from '@vue/share'
import { Comment, Fragment, Text, VNode, isSameVNodeType } from './vnode'
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
  createText(text: string): Element
  createComment(text: string): Element
  setText(node: Element, text: string): void
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
    remove: hostRemove,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment
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

    // 判断节点是否相同
    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      // 不是相同节点卸载
      unmount(oldVNode)
      oldVNode = null
    }
    // 开始区分不同节点
    const { type, shapeFlag } = newVNode

    switch (type) {
      case Comment:
        // TODO: patchComment
        processCommentNode(oldVNode, newVNode, container, anchor)
        break
      case Fragment:
        // TODO: patchFragment
        break
      case Text:
        // TODO: patchText
        processText(oldVNode, newVNode, container, anchor)
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
      console.log('n1', n1, n2)
      // patch diff
      patchElement(n1, n2, anchor)
    }
  }

  /**
   * 元素挂载
   */
  function mountElement(vnode, container, anchor) {
    // 挂载
    const { type, props, children, shapeFlag } = vnode
    // 创建节点。这里一定要将旧节点的el赋值
    const el = (vnode.el = hostCreateElement(type))
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
   * 元素更新
   */
  function patchElement(oldVNode, newVNode, anchor) {
    // 将根节点赋值给新VNode 用于比对后挂载，并且处理props
    const el = (newVNode.el = oldVNode.el!)

    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    // patch children
    patchChildren(oldVNode, newVNode, el, anchor)
    // patch props
    patchProps(el, newVNode, oldProps, newProps)
  }

  /**
   * diff children
   */
  function patchChildren(n1: VNode, n2: VNode, el, anchor) {
    // 取出shapeFlag作对比
    const oldShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    const c1 = n1.children
    const c2 = n2.children
    // 新节点是text
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 旧节点是children
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // TODO: 处理数组孩子。写在旧节点，然后就会挂载文本节点
      }
      // 旧节点是文本
      if (c2 !== c1) {
        hostSetElementText(el, c2)
      }
    } else {
      // 新节点是children
      // 旧节点是children
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新子节点也为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: children diff
        }
        // 新子节点不为 ARRAY_CHILDREN，则直接卸载旧子节点
        else {
          // TODO: 卸载
        }
      } else {
        // 旧节点是文本，新节点children
        if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '')
        }
        // 新子节点为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: 单独挂载新子节点操作
        }
      }
    }
  }

  /**
   * diff props
   */
  function patchProps(el, vnode, oldProps, newProps) {
    // 处理oldprops, newprops都有的props
    for (let key in oldProps) {
      if (key in newProps) {
        hostPatchProp(el, key, oldProps[key], newProps[key])
      }
    }
    // 处理newProps中没有的props
    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
    // 处理newProps独有的props
    for (let key in newProps) {
      if (!(key in oldProps)) {
        hostPatchProp(el, key, null, newProps[key])
      }
    }
  }

  /**
   * 卸载元素
   */

  function unmount(n1) {
    hostRemove(n1.el)
  }

  /**
   * 文本节点处理
   */
  function processText(n1: VNode | null, n2: VNode, container, anchor) {
    if (n1 == null) {
      // 挂载
      n2.el = hostCreateText(n2.children)
      hostInsert(n2.el, container, anchor)
    } else {
      // 更新
      const el = (n2.el = n1.el!)
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children as string)
      }
    }
  }

  /**
   * 注释节点处理
   */
  function processCommentNode(n1: VNode | null, n2: VNode, container, anchor) {
    if (n1 == null) {
      // 挂载
      n2.el = hostCreateComment(n2.children)
      hostInsert(n2.el, container, anchor)
    } else {
      // 不支持更新注释
      n1.el = n2.el
    }
  }

  /**
   * 组件处理
   */
  function processComponent(n1: VNode | null, n2: VNode, container, anchor) {}

  const render = (vnode: VNode, container) => {
    // 新节点存在旧节点不存在
    if (vnode == null) {
      // TODO: 卸载
      if (container._vnode) {
        unmount(container._vnode)
      }
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
