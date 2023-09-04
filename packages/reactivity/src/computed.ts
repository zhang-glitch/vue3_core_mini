import { ReactiveEffect } from './effect'
import { Deps } from './dep'
import { trackRefValue, triggerRefValue } from './ref'
import { isFunction } from "@vue/share"

export function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions)
  let getter
  if(onlyGetter) {
    getter = getterOrOptions
  }
  return new ComputedRefImpl(getter)
}

export class ComputedRefImpl<T extends unknown> {
  private _value!: T
  private __v_isRef = true
  public deps: Deps | undefined
  // 第一次进入默认需要触发getter
  private _dirty = true
  private effect: ReactiveEffect
  constructor(getter: () => any) {
    // 创建依赖对象, 并传入调度器
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        // 将其变成true，表示computed依赖发生变化
        this._dirty = true
        triggerRefValue(this)
      }
    })
    this.effect.computed = this
  }

  get value() {
    // 触发依赖收集
    trackRefValue(this)
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }

  // set value () {

  // }
}
