import { ComputedRefImpl } from './computed';
import createDeps, { type Deps } from './dep'
export let activeEffect: ReactiveEffect

// 定义deps对象接口类型
export let targetWeakMap: WeakMap<object, Map<any, Deps>> = new WeakMap()
export type SchedulerEffect =  () => any
export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: SchedulerEffect
}

// 内部定义一个fn属性和run方法
export class ReactiveEffect<T = any> {
  computed?: ComputedRefImpl<T>
  constructor(public fn: () => T, public scheduler: SchedulerEffect | null = null) {}

  run() {
    // 将当前reactiveEffect对象赋值给全局对象。
    activeEffect = this
    // 运行fn
    return this.fn()
  }
  
  stop() {

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
  
  // 先执行computed reactiveEffect，防止出现死循环。如果最后一次执行computed reactiveEffect，那么将会触发scheduler，触发computed get value, 又收集依赖，不断循环。

  // 为了做到多次获取computed值，做缓存处理
  [...deps].forEach(effect => {
    if(effect.computed) {
      triggerEffect(effect)
    }
  });

  [...deps].forEach(effect => {
    if(!effect.computed) {
      triggerEffect(effect)
    }
  })
}

/**
 * 
 * 触发一个依赖函数
 */
export function triggerEffect(effect: ReactiveEffect) {
  if(effect.scheduler) {
    effect.scheduler()
  }else {
    effect.run()
  }
}

// 接收一个函数并触发。
export function effect<T>(fn: () => T, options?: ReactiveEffectOptions) {
  // watchEffect
  // 去保存这个fn
  const _effect = new ReactiveEffect(fn)
  // 控制代码调度顺序
  if(options) {
    Object.assign(_effect, options)
  }
  // 懒执行effect
  if(!options || !options.lazy) {
    // 初次加载并执行
    _effect.run()
  }
}
