import { ReactiveEffect } from './effect'

export type Deps = Set<ReactiveEffect>

export default function createDeps(effect?: ReactiveEffect[]): Deps {
  return new Set(effect) as Deps
}
