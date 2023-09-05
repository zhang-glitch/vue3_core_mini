import { mutableHandlers } from './baseHandlers'
import { isObject } from "@vue/share"

export const proxyMap: WeakMap<object, any> = new WeakMap()

export enum ReactiveFlags  {
  IS_REACTIVE = "__is_reactive"
}

// 返回一个proxy
function createReactiveObj(
  target: object,
  baseHandlers: ProxyHandler<object>,
  proxyMap: WeakMap<object, any>
) {
  // 处理，并返回proxy
  let proxyObj = proxyMap.get(target)
  if (!proxyObj) {
    proxyMap.set(target, (proxyObj = new Proxy(target, baseHandlers)))
    // 表示该对象是reactive类型
    proxyObj[ReactiveFlags.IS_REACTIVE] = true

    return proxyObj
  }

  return proxyObj
}

// 定义响应式函数, 返回一个proxy对象
export function reactive(target: object) {
  return createReactiveObj(target, mutableHandlers, proxyMap)
}

// ref转reactive
export const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value as object) : value

  // 判断是否是reactive类型
  export function isReactive(value) {
    return !!(value && value[ReactiveFlags.IS_REACTIVE])
  }
