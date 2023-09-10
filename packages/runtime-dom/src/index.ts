import { createRenderer } from 'packages/runtime-core/src/renderer'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const rendererOptions = /*#__PURE__*/ Object.assign({ patchProp }, nodeOps)

let renderer
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}

// 对外暴露出render
export function render(...args) {
  ensureRenderer().render(...args)
}

// 对外暴露出createApp
export function createApp(...args) {
  console.log('createApp')
}
