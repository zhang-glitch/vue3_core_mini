export function patchEvent(el, key, prevValue, nextValue) {
  // 判断el中缓存的是否有该事件
  const invokers = el._vei || (el._vei = {}) // invoker本身是一个函数
  const existingInvoker = invokers[key]
  // 存在直接替换掉value属性
  if (existingInvoker && nextValue) {
    existingInvoker.value = nextValue
  } else {
    const eventName = handleEventName(key)
    if (nextValue) {
      // add
      const invoker = (invokers[key] = createInvoker(nextValue))
      el.addEventListener(eventName, invoker)
    } else if (existingInvoker) {
      // remove
      el.removeEventListener(eventName, existingInvoker)
      invokers[key] = undefined
    }
  }
}

type EventValue = Function

// 处理事件名称
function handleEventName(key) {
  return key.slice(2).toLocaleLowerCase()
}

function createInvoker(value) {
  const invoker: { value: EventValue } = () => {
    invoker?.value()
  }
  invoker.value = value
  return invoker
}
