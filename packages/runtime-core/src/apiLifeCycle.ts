import { LifecycleHooks } from './enums'

/**
 * 注册 hook
 */
export function injectHook(
  type: LifecycleHooks,
  hook: Function,
  target
): Function | undefined {
  // 将 hook 注册到 组件实例中
  if (target) {
    target[type] = hook
    return hook
  }
}

/**
 * 创建一个指定的 hook
 * @param lifecycle 指定的 hook enum
 * @returns 注册 hook 的方法，就是在instance中放入对应的hooks
 */
export const createHook = (lifecycle: LifecycleHooks) => {
  return (hook, target) => injectHook(lifecycle, hook, target)
}

// before mount
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
// mounted
export const onMounted = createHook(LifecycleHooks.MOUNTED)
