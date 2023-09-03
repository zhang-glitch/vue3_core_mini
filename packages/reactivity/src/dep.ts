import { ReactiveEffect } from './effect'

export type Deps = Set<ReactiveEffect>

// 为了满足一个属性对应多个effect
export default function createDeps(effect?: ReactiveEffect[]): Deps {
  return new Set(effect) as Deps
}
