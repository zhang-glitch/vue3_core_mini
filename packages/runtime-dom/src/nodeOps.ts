const doc = document

export const nodeOps = {
  /**
   * 插入指定元素到指定位置
   */
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null)
  },
  /**
   * 创建节点
   */
  createElement(tag: string) {
    return doc.createElement(tag)
  },
  /**
   * 设置节点文本
   */
  setElementText(el, text) {
    el.textContent = text
  },
  /**
   * 删除指定元素
   */
  remove(child) {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  /**
   * 创建文本节点
   */
  createText: text => doc.createTextNode(text),
  /**
   * 创建注释节点
   */
  createComment: text => doc.createComment(text),
  /**
   * 创建设置文本节点
   */
  setText: (node, text) => {
    node.nodeValue = text
  }
}
