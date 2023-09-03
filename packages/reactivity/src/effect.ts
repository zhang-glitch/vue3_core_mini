import createDeps, { type Deps } from './dep'
export let activeEffect: ReactiveEffect

// 定义deps对象接口类型
export let targetWeakMap: WeakMap<object, Map<any, Deps>> = new WeakMap()

// 内部定义一个fn属性和run方法
export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    // 将当前reactiveEffect对象赋值给全局对象。
    activeEffect = this
    // 运行fn
    return this.fn()
  }
}

export function track(target: object, key: string | symbol) {
  console.log('触发getter')
  // 如果当前不存在执行函数，则直接 return
  if (!activeEffect) return
  // 拿到当前对象的map对象
  let targetMap = targetWeakMap.get(target)
  if (!targetMap) {
    // 如果没有就创建一个map对象，用于以后保存数据 （key : deps）
    targetWeakMap.set(target, (targetMap = new Map()))
  }

  // 获取当前是否有set对象
  let deps = targetMap.get(key)
  if (!deps) {
    // 用于存放ReactiveEffect对象
    targetMap.set(key, (deps = createDeps()))
  }

  // 收集依赖函数
  trackEffects(deps)

}

/**
 * 利用deps 依次跟踪指定 key 的所有effect
 */
export function trackEffects(deps: Deps) {
  deps.add(activeEffect!) // 添加对应的依赖函数, 确保activeEffect一定是有值的。
}

export function trigger(target: object, key: string | symbol) {
  console.log('触发setter')

  // 触发依赖函数
  const targetMap = targetWeakMap.get(target)
  if (!targetMap) return // 这是当依赖map都没有直接return

  const deps = targetMap.get(key)

  if (!deps) return

  triggerEffects(deps)
}

/**
 * 触发指定 key 收集的依赖函数
 */
export function triggerEffects(deps: Deps) {
  [...deps].forEach(effect => {
    triggerEffect(effect)
  })
}

/**
 * 
 * 触发一个依赖函数
 */
export function triggerEffect(effect: ReactiveEffect) {
  effect.run()
}

// 接收一个函数并触发。
export function effect<T>(fn: () => T) {
  // watchEffect
  // 去保存这个fn
  const _effect = new ReactiveEffect(fn)
  // 初次加载并执行
  _effect.run()
}
