
/**
 * 是否是对象
 */
export function isObject(value) {
  return value !== null && typeof value === "object"
}

/**
 * 是否是相同值
 */
export function hasChanged(val, oldVal) {
  return !Object.is(val, oldVal)
}