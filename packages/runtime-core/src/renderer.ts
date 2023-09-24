import { ReactiveEffect } from './../../reactivity/src/effect'
import { EMPTY_OBJ, isString } from '@vue/share'
import { Comment, Fragment, Text, VNode, isSameVNodeType } from './vnode'
import { ShapeFlags } from 'packages/share/src/shapeFlags'
import { normalizeVNode, renderComponentRoot } from './componentRenderUtils'
import { createComponentInstance, setupComponent } from './component'
import { queuePreFlushCb } from './scheduler'

export interface RendererOptions {
  // props diff
  patchProp: (el: Element, key: string, preValue: any, nextValue: any) => void
  // 寄主环境dom操作options
  // 创建dom
  createElement: (type: string) => Element
  // 设置文本
  setElementText: (node: Element, text: string) => void
  // 插入
  insert: (el: Element, parent: Element, anchor?: any | null) => void
  // 卸载指定dom
  remove: (el) => void
  createText(text: string): Element
  createComment(text: string): Element
  setText(node: Element, text: string): void
}

/**
 * 对外暴露的创建渲染器的方法
 */
export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

// 更新和挂载的主要逻辑
function baseCreateRenderer(options: RendererOptions) {
  const {
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    insert: hostInsert,
    remove: hostRemove,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment
  } = options

  /**
   *
   * @param oldVNode 旧节点，如果为null这表示第一次挂载
   * @param newVNode 新节点
   * @param el 挂载dom
   */
  function patch(
    oldVNode: VNode | null,
    newVNode: VNode,
    container,
    anchor: Element | null = null
  ) {
    // 两节点相同
    if (oldVNode === newVNode) return

    // 判断节点是否相同
    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      // 不是相同节点卸载
      unmount(oldVNode)
      oldVNode = null
    }
    // 开始区分不同节点
    const { type, shapeFlag } = newVNode

    switch (type) {
      case Comment:
        // TODO: patchComment
        processCommentNode(oldVNode, newVNode, container, anchor)
        break
      case Fragment:
        // TODO: patchFragment
        processFragment(oldVNode, newVNode, container, anchor)
        break
      case Text:
        // TODO: patchText
        processText(oldVNode, newVNode, container, anchor)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 挂载dom元素
          processElement(oldVNode, newVNode, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 组件
          processComponent(oldVNode, newVNode, container, anchor)
        }
    }
  }

  /**
   * 元素处理
   */
  function processElement(n1: VNode | null, n2: VNode, container, anchor) {
    if (n1 == null) {
      // 挂载
      mountElement(n2, container, anchor)
    } else {
      console.log('n1', n1, n2)
      // patch diff
      patchElement(n1, n2, anchor)
    }
  }

  /**
   * 元素挂载
   */
  function mountElement(vnode, container, anchor) {
    // 挂载
    const { type, props, children, shapeFlag } = vnode
    // 创建节点。这里一定要将旧节点的el赋值
    const el = (vnode.el = hostCreateElement(type))
    // 处理孩子是数组
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // TODO: mountChildren
      mountChildren(vnode, el, anchor)
    } else {
      // 处理文本
      hostSetElementText(el, children)
    }

    // 处理props
    for (let key in props) {
      hostPatchProp(el, key, null, props[key])
    }

    // 插入元素
    hostInsert(el, container, anchor)
  }

  /**
   * 元素更新
   */
  function patchElement(oldVNode, newVNode, anchor) {
    // 将根节点赋值给新VNode 用于比对后挂载，并且处理props
    const el = (newVNode.el = oldVNode.el!)

    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    // patch children
    patchChildren(oldVNode, newVNode, el, anchor)
    // patch props
    patchProps(el, newVNode, oldProps, newProps)
  }

  /**
   * diff children
   */
  function patchChildren(n1: VNode, n2: VNode, el, anchor) {
    // 取出shapeFlag作对比
    const oldShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    const c1 = n1.children
    const c2 = n2.children
    // 新节点是text
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 旧节点是children
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // TODO: 处理数组孩子。写在旧节点，然后就会挂载文本节点
      }
      // 旧节点是文本
      if (c2 !== c1) {
        hostSetElementText(el, c2)
      }
    } else {
      // 新节点是children
      // 旧节点是children
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新子节点也为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: children diff
          patchKeyedChildren(c1, c2, el, anchor)
        }
        // 新子节点不为 ARRAY_CHILDREN，则直接卸载旧子节点
        else {
          // TODO: 卸载
        }
      } else {
        // 旧节点是文本，新节点children
        if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '')
        }
        // 新子节点为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: 单独挂载新子节点操作
        }
      }
    }
  }

  /**
   * diff props
   */
  function patchProps(el, vnode, oldProps, newProps) {
    // 处理oldprops, newprops都有的props
    for (let key in oldProps) {
      if (key in newProps) {
        hostPatchProp(el, key, oldProps[key], newProps[key])
      }
    }
    // 处理newProps中没有的props
    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
    // 处理newProps独有的props
    for (let key in newProps) {
      if (!(key in oldProps)) {
        hostPatchProp(el, key, null, newProps[key])
      }
    }
  }

  /**
   * diff children
   */
  function patchKeyedChildren(c1, c2, container, parentAnchor) {
    const l1 = c1.length
    const l2 = c2.length
    let oldVIndex = l1 - 1
    let newVIndex = l2 - 1
    let i = 0
    // 自前向后比较对应位置vnode
    while (i <= oldVIndex && i <= newVIndex) {
      if (isSameVNodeType(c1[i], c2[i])) {
        patch(c1[i], c2[i], container, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 自后向前比较对应位置vnode
    while (i <= oldVIndex && i <= newVIndex) {
      if (isSameVNodeType(c1[oldVIndex], c2[newVIndex])) {
        patch(c1[oldVIndex], c2[newVIndex], container, parentAnchor)
      } else {
        break
      }
      oldVIndex--
      newVIndex--
    }

    // 新节点多于旧节点(可以匹配到在前新增还是在后新增两种情况)
    if (i > oldVIndex) {
      if (i <= newVIndex) {
        // 判断锚点位置
        const nextPos = newVIndex + 1
        // 如果之后插入，anchor为null，之前插入，anchor就是新vnodes的第二个元素
        const anchor = nextPos < l2 ? (c2[nextPos] as VNode).el : parentAnchor

        while (i <= newVIndex) {
          patch(null, c2[i], container, anchor)
          i++
        }
      }
    }

    // 写在多余的旧节点
    // [a,b] [a] i = 1 newVIndex = 0 oldIndex = 1
    // [a,b] [b] i = 0 newIndex = -1 oldIndex = 0
    else if (i > newVIndex) {
      while (i <= oldVIndex) {
        unmount(c1[i])
        i++
      }
    }

    // 乱序下的diff
    else {
      // 旧子节点的开始索引：oldChildrenStart
      const oldStartIndex = i
      // 新子节点的开始索引：newChildrenStart
      const newStartIndex = i
      // 5.1 创建一个 <key（新节点的 key）:index（新节点的位置）> 的 Map 对象 keyToNewIndexMap。通过该对象可知：新的 child（根据 key 判断指定 child） 更新后的位置（根据对应的 index 判断）在哪里
      const keyToNewIndexMap = new Map()
      // 通过循环为 keyToNewIndexMap 填充值（s2 = newChildrenStart; e2 = newChildrenEnd）
      for (i = newStartIndex; i <= newVIndex; i++) {
        // 从 newChildren 中根据开始索引获取每一个 child（c2 = newChildren）
        const nextChild = normalizeVNode(newVIndex[i])
        // child 必须存在 key（这也是为什么 v-for 必须要有 key 的原因）
        if (nextChild.key != null) {
          // 把 key 和 对应的索引，放到 keyToNewIndexMap 对象中
          keyToNewIndexMap.set(nextChild.key, i)
        }
      }

      // 5.2 循环 oldChildren ，并尝试进行 patch（打补丁）或 unmount（删除）旧节点
      let j
      // 记录已经修复的新节点数量
      let patched = 0
      // 新节点待修补的数量 = newChildrenEnd - newChildrenStart + 1
      const toBePatched = newVIndex - newStartIndex + 1
      // 标记位：节点是否需要移动
      let moved = false
      // 配合 moved 进行使用，它始终保存当前最大的 index 值
      let maxNewIndexSoFar = 0
      // 创建一个 Array 的对象，用来确定最长递增子序列。它的下标表示：《新节点的下标（newIndex），不计算已处理的节点。即：n-c 被认为是 0》，元素表示：《对应旧节点的下标（oldIndex），永远 +1》
      // 但是，需要特别注意的是：oldIndex 的值应该永远 +1 （ 因为 0 代表了特殊含义，他表示《新节点没有找到对应的旧节点，此时需要新增新节点》）。即：旧节点下标为 0， 但是记录时会被记录为 1
      const newIndexToOldIndexMap = new Array(toBePatched)
      // 遍历 toBePatched ，为 newIndexToOldIndexMap 进行初始化，初始化时，所有的元素为 0
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0
      // 遍历 oldChildren（s1 = oldChildrenStart; e1 = oldChildrenEnd），获取旧节点，如果当前 已经处理的节点数量 > 待处理的节点数量，那么就证明：《所有的节点都已经更新完成，剩余的旧节点全部删除即可》
      for (i = oldStartIndex; i <= oldVIndex; i++) {
        // 获取旧节点
        const prevChild = c1[i]
        // 如果当前 已经处理的节点数量 > 待处理的节点数量，那么就证明：《所有的节点都已经更新完成，剩余的旧节点全部删除即可》
        if (patched >= toBePatched) {
          // 所有的节点都已经更新完成，剩余的旧节点全部删除即可
          unmount(prevChild)
          continue
        }
        // 新节点需要存在的位置，需要根据旧节点来进行寻找（包含已处理的节点。即：n-c 被认为是 1）
        let newIndex
        // 旧节点的 key 存在时
        if (prevChild.key != null) {
          // 根据旧节点的 key，从 keyToNewIndexMap 中可以获取到新节点对应的位置
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          // 旧节点的 key 不存在（无 key 节点）
          // 那么我们就遍历所有的新节点，找到《没有找到对应旧节点的新节点，并且该新节点可以和旧节点匹配》，如果能找到，那么 newIndex = 该新节点索引
          for (j = newStartIndex; j <= newVIndex; j++) {
            // 找到《没有找到对应旧节点的新节点，并且该新节点可以和旧节点匹配》
            if (
              newIndexToOldIndexMap[j - newStartIndex] === 0 &&
              isSameVNodeType(prevChild, c2[j])
            ) {
              // 如果能找到，那么 newIndex = 该新节点索引
              newIndex = j
              break
            }
          }
        }
        // 最终没有找到新节点的索引，则证明：当前旧节点没有对应的新节点
        if (newIndex === undefined) {
          // 此时，直接删除即可
          unmount(prevChild)
        }
        // 没有进入 if，则表示：当前旧节点找到了对应的新节点，那么接下来就是要判断对于该新节点而言，是要 patch（打补丁）还是 move（移动）
        else {
          // 为 newIndexToOldIndexMap 填充值：下标表示：《新节点的下标（newIndex），不计算已处理的节点。即：n-c 被认为是 0》，元素表示：《对应旧节点的下标（oldIndex），永远 +1》
          // 因为 newIndex 包含已处理的节点，所以需要减去 s2（s2 = newChildrenStart）表示：不计算已处理的节点
          newIndexToOldIndexMap[newIndex - newStartIndex] = i + 1
          // maxNewIndexSoFar 会存储当前最大的 newIndex，它应该是一个递增的，如果没有递增，则证明有节点需要移动
          if (newIndex >= maxNewIndexSoFar) {
            // 持续递增
            maxNewIndexSoFar = newIndex
          } else {
            // 没有递增，则需要移动，moved = true
            moved = true
          }
          // 打补丁
          patch(prevChild, c2[newIndex], container, null)
          // 自增已处理的节点数量
          patched++
        }
      }

      // 5.3 针对移动和挂载的处理
      // 仅当节点需要移动的时候，我们才需要生成最长递增子序列，否则只需要有一个空数组即可
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : []
      // j >= 0 表示：初始值为 最长递增子序列的最后下标
      // j < 0 表示：《不存在》最长递增子序列。
      j = increasingNewIndexSequence.length - 1
      // 倒序循环，以便我们可以使用最后修补的节点作为锚点
      for (i = toBePatched - 1; i >= 0; i--) {
        // nextIndex（需要更新的新节点下标） = newChildrenStart + i
        const nextIndex = newStartIndex + i
        // 根据 nextIndex 拿到要处理的 新节点
        const nextChild = c2[nextIndex]
        // 获取锚点（是否超过了最长长度）
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor
        // 如果 newIndexToOldIndexMap 中保存的 value = 0，则表示：新节点没有用对应的旧节点，此时需要挂载新节点
        if (newIndexToOldIndexMap[i] === 0) {
          // 挂载新节点
          patch(null, nextChild, container, anchor)
        }
        // moved 为 true，表示需要移动
        else if (moved) {
          // j < 0 表示：不存在 最长递增子序列
          // i !== increasingNewIndexSequence[j] 表示：当前节点不在最后位置
          // 那么此时就需要 move （移动）
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor)
          } else {
            // j 随着循环递减
            j--
          }
        }
      }
    }
  }

  /**
   * 移动节点到指定位置
   */
  const move = (vnode, container, anchor) => {
    const { el } = vnode
    hostInsert(el!, container, anchor)
  }

  /**
   * 卸载元素
   */

  function unmount(n1) {
    hostRemove(n1.el)
  }

  /**
   * 文本节点处理
   */
  function processText(n1: VNode | null, n2: VNode, container, anchor) {
    if (n1 == null) {
      // 挂载
      n2.el = hostCreateText(n2.children)
      hostInsert(n2.el, container, anchor)
    } else {
      // 更新
      const el = (n2.el = n1.el!)
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children as string)
      }
    }
  }

  /**
   * 注释节点处理
   */
  function processCommentNode(n1: VNode | null, n2: VNode, container, anchor) {
    if (n1 == null) {
      // 挂载
      n2.el = hostCreateComment(n2.children)
      hostInsert(n2.el, container, anchor)
    } else {
      // 不支持更新注释
      n1.el = n2.el
    }
  }

  /**
   * 片段节点处理
   */
  function processFragment(n1: VNode | null, n2: VNode, container, anchor) {
    if (n1 == null) {
      // TODO: mountChildren挂载
      mountChildren(n2, container, anchor)
    } else {
      // Fragment挂载container依旧是render的根节点，而不是以前旧节点的el
      patchChildren(n1, n2, container, anchor)
    }
  }

  /**
   * 挂载children
   */
  function mountChildren(vnode: VNode, container, anchor) {
    for (let item of vnode.children) {
      const childVNode = normalizeVNode(item)
      patch(null, childVNode, container, anchor)
    }
  }

  /**
   * 组件处理
   */
  function processComponent(n1: VNode | null, n2: VNode, container, anchor) {
    if (n1 == null) {
      // TODO: 挂载
      mountComponent(n2, container, anchor)
    } else {
      // TODO: 更新
      patchComponent(n1, n2, container, anchor)
    }
  }

  /**
   * 组件挂载
   */
  function mountComponent(vnode, container, anchor) {
    //创建组件实例
    const instance = (vnode.component = createComponentInstance(vnode))
    // 初始化组件
    setupComponent(instance)

    // 设置组件渲染
    setupRenderEffect(instance, vnode, container, anchor)
  }

  /**
   * 组件渲染
   */
  function setupRenderEffect(instance, vnode, container, anchor) {
    // 创建reactiveEffect fn函数 (组件挂载和更新)
    const componentUpdateFn = () => {
      // 当前处于 mounted 之前，即执行 挂载 逻辑
      if (!instance.isMounted) {
        // 挂载之前触发beforeMount
        if (instance.bm) {
          instance.bm()
        }
        // 生成组件vnode
        const subTree = (instance.subTree = renderComponentRoot(instance))
        // 挂载组件
        patch(null, subTree, container, anchor)
        // 保存组件根节点
        vnode.el = subTree.el

        // 挂载之后触发mounted
        if (instance.m) {
          instance.m()
        }

        // 修改 mounted 状态
        instance.isMounted = true
      } else {
        // 当响应式状态发生变化，那么将会触发组件更新
        let { next, vnode } = instance
        if (!next) {
          next = vnode
        }

        const nextTree = renderComponentRoot(instance)
        const prevTree = instance.subTree
        instance.subTree = nextTree
        patch(prevTree, nextTree, container, anchor)

        next.el = nextTree.el
      }
    }

    // 创建依赖对象
    const effect = (instance.effect = new ReactiveEffect(
      componentUpdateFn,
      () => queuePreFlushCb(update)
    ))

    // 生成 update 函数
    const update = (instance.update = () => effect.run())

    // 触发 update 函数，本质上触发的是 componentUpdateFn
    update()
  }

  /**
   * 组件更新
   */
  function patchComponent(n1: VNode | null, n2: VNode, container, anchor) {}

  const render = (vnode: VNode, container) => {
    // 新节点存在旧节点不存在
    if (vnode == null) {
      // TODO: 卸载
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      // 打补丁patch / mount
      patch(container._vnode, vnode, container)
    }
    // 将当前vnode赋值给container._vnode作为旧节点
    container._vnode = vnode
  }

  return {
    render
  }
}

/**
 * 获取最长递增子序列下标
 * 维基百科：https://en.wikipedia.org/wiki/Longest_increasing_subsequence
 * 百度百科：https://baike.baidu.com/item/%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F%E5%88%97/22828111
 */
/**
 * 获取最长递增子序列下标
 * 维基百科：https://en.wikipedia.org/wiki/Longest_increasing_subsequence
 * 百度百科：https://baike.baidu.com/item/%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F%E5%88%97/22828111
 */
function getSequence(arr) {
  // 获取一个数组浅拷贝。注意 p 的元素改变并不会影响 arr
  // p 是一个最终的回溯数组，它会在最终的 result 回溯中被使用
  // 它会在每次 result 发生变化时，记录 result 更新前最后一个索引的值
  const p = arr.slice()
  // 定义返回值（最长递增子序列下标），因为下标从 0 开始，所以它的初始值为 0
  const result = [0]
  let i, j, u, v, c
  // 当前数组的长度
  const len = arr.length
  // 对数组中所有的元素进行 for 循环处理，i = 下标
  for (i = 0; i < len; i++) {
    // 根据下标获取当前对应元素
    const arrI = arr[i]
    //
    if (arrI !== 0) {
      // 获取 result 中的最后一个元素，即：当前 result 中保存的最大值的下标
      j = result[result.length - 1]
      // arr[j] = 当前 result 中所保存的最大值
      // arrI = 当前值
      // 如果 arr[j] < arrI 。那么就证明，当前存在更大的序列，那么该下标就需要被放入到 result 的最后位置
      if (arr[j] < arrI) {
        p[i] = j
        // 把当前的下标 i 放入到 result 的最后位置
        result.push(i)
        continue
      }
      // 不满足 arr[j] < arrI 的条件，就证明目前 result 中的最后位置保存着更大的数值的下标。
      // 但是这个下标并不一定是一个递增的序列，比如： [1, 3] 和 [1, 2]
      // 所以我们还需要确定当前的序列是递增的。
      // 计算方式就是通过：二分查找来进行的

      // 初始下标
      u = 0
      // 最终下标
      v = result.length - 1
      // 只有初始下标 < 最终下标时才需要计算
      while (u < v) {
        // (u + v) 转化为 32 位 2 进制，右移 1 位 === 取中间位置（向下取整）例如：8 >> 1 = 4;  9 >> 1 = 4; 5 >> 1 = 2
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Right_shift
        // c 表示中间位。即：初始下标 + 最终下标 / 2 （向下取整）
        c = (u + v) >> 1
        // 从 result 中根据 c（中间位），取出中间位的下标。
        // 然后利用中间位的下标，从 arr 中取出对应的值。
        // 即：arr[result[c]] = result 中间位的值
        // 如果：result 中间位的值 < arrI，则 u（初始下标）= 中间位 + 1。即：从中间向右移动一位，作为初始下标。 （下次直接从中间开始，往后计算即可）
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          // 否则，则 v（最终下标） = 中间位。即：下次直接从 0 开始，计算到中间位置 即可。
          v = c
        }
      }
      // 最终，经过 while 的二分运算可以计算出：目标下标位 u
      // 利用 u 从 result 中获取下标，然后拿到 arr 中对应的值：arr[result[u]]
      // 如果：arr[result[u]] > arrI 的，则证明当前  result 中存在的下标 《不是》 递增序列，则需要进行替换
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        // 进行替换，替换为递增序列
        result[u] = i
      }
    }
  }
  // 重新定义 u。此时：u = result 的长度
  u = result.length
  // 重新定义 v。此时 v = result 的最后一个元素
  v = result[u - 1]
  // 自后向前处理 result，利用 p 中所保存的索引值，进行最后的一次回溯
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
