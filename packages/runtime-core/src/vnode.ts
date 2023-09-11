import { ShapeFlags } from 'packages/share/src/shapeFlags'
import { isArray, isFunction, isObject, isString } from '@vue/share'

// 定义特殊类型， Text, Fragment, Comment
export const Text = Symbol('Text')
export const Fragment = Symbol('Symbol')
export const Comment = Symbol('Comment')

export interface VNode {
  __is_VNode: true
  type: any
  props: any
  shapeFlag: number
  children: any
}

export function isVNode(val) {
  return val && val.__is_VNode
}

export function createVNode(type: any, props?: any, children?: any): VNode {
  // 根据传入的type第一次判断shapeFlag
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0

  // 处理props
  if (props) {
    const { class: cklass } = props
    // 处理class
    props.class = normalizeClass(cklass)
  }

  return createBaseVNode(type, props, children, shapeFlag)
}

function createBaseVNode(
  type: any,
  props: any,
  children: any,
  shapeFlag: number
): VNode {
  // 初始化vnode
  const vnode = {
    __is_VNode: true,
    type,
    children,
    props,
    shapeFlag
  } as VNode
  // 标准化children,二次处理shapeFlag
  normalizeChildren(vnode)

  return vnode
}

// 标准化children
function normalizeChildren(vnode: VNode) {
  // 定义type承接children的shapeFlag
  let type = 0
  let { children } = vnode
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (isObject(children)) {
    // TODO: object
  } else if (isFunction(children)) {
    // TODO: function
  } else {
    // children 为 string
    children = String(children)
    // 为 type 指定 Flags
    type = ShapeFlags.TEXT_CHILDREN
  }

  // 二次处理shapeFlag
  vnode.shapeFlag |= type
  vnode.children = children
}

// 标准化class
function normalizeClass(cklass: any) {
  let res = ''
  if (isString(cklass)) {
    res = cklass
  } else if (isArray(cklass)) {
    // 处理每一个子项，可能还是字符串，数组，对象
    for (let item of cklass) {
      const normalized = normalizeClass(item)
      res += normalized + ' '
    }
  } else if (isObject(cklass)) {
    for (let key in cklass) {
      if (cklass[key]) {
        res += key + ' '
      }
    }
  }
  return res.trim()
}

/**
 * 判断是否是相同类型节点
 */

export function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}
