import { activeEffect, trackEffects, triggerEffects } from './effect'
import createDeps, { Deps } from './dep'
import { toReactive } from './reactive'
import { hasChanged } from "@vue/share"

export interface Ref<T = any> {
  value: T
}

export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}

type RefBase<T> = {
  deps?: Deps
  value: T
}

export function ref(value?: unknown) {
  return createRef(value, false)
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}

class RefImpl<T extends unknown> {
  public deps: Deps | undefined
  private _value: T
  private _rawValue: T

  public readonly __v_isRef = true

  constructor(value: T, public readonly __v_isShallow: boolean) {
    this._rawValue = value
    // 如果是简单数据类型直接赋值，否则转化为reactive响应式
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    // 依赖收集
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    // 依赖触发
    if(hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      // 赋值最新值
      this._value = toReactive(newValue)
      triggerRefValue(this)
    }
  }
}

/**
 * 基本数据类型的依赖收集
 */
export function trackRefValue(ref: RefBase<any>) {
  // 只有effect有值时才收集依赖
  if (activeEffect) {
    trackEffects(ref.deps || (ref.deps = createDeps()))
  }
}

/**
 * 基本数据类型的依赖触发
 */
export function triggerRefValue(ref: RefBase<any>) {
  if (ref.deps) {
    triggerEffects(ref.deps)
  }
}
