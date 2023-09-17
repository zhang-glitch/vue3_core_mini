/**
 * 创建组件实例
 */
let uid = 0
export function createComponentInstance(vnode) {
  const type = vnode.type

  const instance = {
    uid: uid++, // 唯一标记
    vnode, // 虚拟节点
    type, // 组件类型
    subTree: null!, // render 函数的返回值
    effect: null!, // ReactiveEffect 实例
    update: null!, // update 函数，触发 effect.run
    render: null // 组件内的 render 函数
  }

  return instance
}

/**
 * 初始化组件属性
 */

export function setupComponent(instance) {
  // 为 render 赋值
  const setupResult = setupStatefulComponent(instance)
  return setupResult
}

function setupStatefulComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  // 存在 setup ，则直接获取 setup 函数的返回值即可
  if (setup) {
    const setupResult = setup()
  } else {
    // 获取组件实例
    finishComponentSetup(instance)
  }
}

function finishComponentSetup(instance) {
  const Component = instance.type

  // 组件不存在 render 时，才需要重新赋值
  if (!instance.render) {
    // 为 render 赋值
    instance.render = Component.render
  }
}
