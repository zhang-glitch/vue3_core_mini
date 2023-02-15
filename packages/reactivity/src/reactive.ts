import { mutableHandlers } from './baseHandlers'
export const proxyMap: WeakMap<object, any> = new WeakMap()

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
    return proxyObj
  }

  return proxyObj
}

// 定义响应式函数, 返回一个proxy对象
export function reactive(target: object) {
  return createReactiveObj(target, mutableHandlers, proxyMap)
}
