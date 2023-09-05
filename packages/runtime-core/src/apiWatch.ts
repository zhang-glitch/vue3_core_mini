import { isObject } from '@vue/share';
import { EMPTY_OBJ } from './../../share/src/index';
import { hasChanged } from '@vue/share';
import { ReactiveEffect } from './../../reactivity/src/effect';
import { isReactive } from "packages/reactivity/src/reactive";
import { queuePreFlushCb } from "./scheduler";

export interface WatchOptions {
  immediate?: boolean;
  deep?: boolean;
}

export function watch(source, cb: Function, options?: WatchOptions) {
  return doWatch(source, cb, options)
}


function doWatch(source, cb, {immediate, deep}: WatchOptions = EMPTY_OBJ) {
  let getter: () => any

  if(isReactive(source)) {
    getter = () => source
    deep = true
  }else {
    getter = () => {}
  }

  if(cb && deep) {
    // 触发依赖收集 源码traverse进行处理。将source内部的所有属性自动触发一次value,收集全部依赖
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let oldValue = {}

  const job = () => {
    if(cb) {
      const newValue = effect.run()

      if(deep || hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue)
        oldValue = newValue
      }
    }
  }

  let scheduler = () => queuePreFlushCb(job)

  const effect = new ReactiveEffect(getter, scheduler)

  if(cb) {
    if(immediate) {
      job()
    }else {
      // 触发getter函数，拿到值保存
      oldValue = effect.run()
    }
  }else {
    effect.run()
  }
  return () => {
    effect.stop()
  }
}

// 循环获取source的属性，收集依赖
function traverse(value) {
  if(!isObject(value)) {
    return value
  }

  for(let key in value) {
    traverse(value[key])
  }

  return value
}