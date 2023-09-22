import { onBeforeMount, onMounted } from './apiLifeCycle'
import { reactive } from '@vue/reactivity'
import { isObject } from '@vue/share'

/**
 * 获取data对象，将其转化成响应式数据
 */
export function applyOptions(instance) {
  const {
    data: dataOptions,
    beforeCreate,
    created,
    beforeMount,
    mounted
  } = instance.type

  // 处理options之前调用beforeCreate
  if (beforeCreate) {
    callHook(beforeCreate, instance.data)
  }

  if (dataOptions) {
    const data = dataOptions()
    if (isObject(data)) {
      instance.data = reactive(data)
    }
  }

  // 处理options之后调用created
  if (created) {
    callHook(created, instance.data)
  }

  // 在instance中注册生命周期钩子。并绑定this
  function registerLifecycleHook(register: Function, hook?: Function) {
    register(hook?.bind(instance.data), instance)
  }

  // 处理其他hooks
  registerLifecycleHook(onBeforeMount, beforeMount)
  registerLifecycleHook(onMounted, mounted)
}

function callHook(hook, instance) {
  hook.call(instance)
}
