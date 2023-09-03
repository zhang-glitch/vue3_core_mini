
import { hasChanged } from "@vue/share"
import { track, trigger } from './effect'

function createGetter() {
  return function (
    target: object,
    key: string | symbol,
    receiver: ProxyHandler<object>
  ) {
    // 为啥只有这个在track之前执行才可以
    // const res = Reflect.get(target, key, receiver)
    // 触发getter
    track(target, key)
    // return res
    return Reflect.get(target, key, receiver)
  }
}

function createSetter() {
  return function (
    target: object,
    key: string | symbol,
    value: any,
    receiver: ProxyHandler<object>
  ) {
    const oldVal = target[key]
    // 这里需要先改变key的值。
    const res = Reflect.set(target, key, value, receiver)
    // 只有值发生改变时才需要触发，相同值不需要触发。
    if(hasChanged(value, oldVal)) {
      // 触发setter
      trigger(target, key)
    }
    return res
  }
}

const get = createGetter()
const set = createSetter()

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}

// getter
// setter
// getter
