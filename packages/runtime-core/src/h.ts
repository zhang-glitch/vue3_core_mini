import { isArray, isObject } from "@vue/share";
import { VNode, createVNode, isVNode } from './vnode';

/**
 * 处理传入参数，调用createVNode创建vnode
 */
export function h(type: any, propsOrChildren: any, children: any): VNode {
  const argsLength = arguments.length
  // 先进行参数数量比对
  if(argsLength === 2) {
    if(isObject(propsOrChildren) && !isArray(propsOrChildren)) { // 作为props
      if(isVNode(propsOrChildren)) { // 是component
        return createVNode(type, null,  [propsOrChildren])
      }else { // 是对象并且不是vnode，那么将作为props
        return createVNode(type, propsOrChildren)
      }
    } else {
      // omit props 其他任意类型
      return createVNode(type, null, propsOrChildren)
    }
  }else { // 三个参数及以上,都将作为children
    if(argsLength > 3) {
      children = [...arguments].slice(2)
    }else if(argsLength === 3 && isVNode(children)){
      // vnode要包装秤一个数组
      children = [children]
    }
  }

  return createVNode(type, propsOrChildren,  children)
}