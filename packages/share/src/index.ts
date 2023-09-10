/**
 * 是否是对象
 */
export function isObject(value) {
  return value !== null && typeof value === 'object'
}

/**
 * 是否是相同值
 */
export function hasChanged(val, oldVal) {
  return !Object.is(val, oldVal)
}

/**
 * 是否是函数
 */
export function isFunction(val) {
  return typeof val === 'function'
}

/**
 * 空对象
 */
export const EMPTY_OBJ: { readonly [key: string]: any } = {}

/**
 * 是否是字符串
 */
export function isString(val) {
  return typeof val === 'string'
}

/**
 * 判断是否是数组
 */
export function isArray(val) {
  return Array.isArray(val)
}

/**
 * 判断是否是以on开头的事件
 */

export function isOn(val) {
  return val && val.startsWith('on')
}
