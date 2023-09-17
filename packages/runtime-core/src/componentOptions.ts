import { reactive } from '@vue/reactivity'
import { isObject } from '@vue/share'

/**
 * 获取data对象，将其转化成响应式数据
 */
export function applyOptions(instance) {
  const { data: dataOptions } = instance.type
  if (dataOptions) {
    const data = dataOptions()
    if (isObject(data)) {
      instance.data = reactive(data)
    }
  }
}
