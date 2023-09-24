# vue3_core_mini

分析 vue3 源码后，实现的一个小型 vue3

# 基础知识

## 命令式

详细描述做事的过程。**关注过程的一种编程范式**，他描述了完成一个功能的详细逻辑与步骤。

## 声明式

**不关注过程，只关注结果的范式。** 并不关心完成一个功能的详细逻辑与步骤。

- 命令式的性能 > 声明式的性能
- 命令式的可维护性 < 声明式的可维护性 （对于用户来说）

所以框架的设计过程其实是一个不断在可维护性和性能之间进行取舍的过程。在保证可维护性的基础上，尽可能的减少性能消耗。

**Vue 封装了命令式的逻辑，而对外暴露出了声明式的接口。**

## 编译时 compiler

**把 template 中的 html 编译成 render 函数。**

```js
<div id="app"></div>
  <script>
    const {compile, createApp} = Vue

    const html = `
      <p class="pp">编译时</p>
    `
    const render = compile(html)

    createApp({
      render
    }).mount("#app")
  </script>
```

## 运行时 runtime

**运行时可以利用 render 把 vnode 渲染成真实的 dom 节点。**

render 函数就是挂载 h 函数生成的虚拟 dom。提供的 render 属性函数是用来生成虚拟 dom 树的。（vue2 的 render option, vue3 setup 返回一个函数, comple(template)编译器生成的）

```js
<div id="app"></div>
  <script>
    // 运行时可以利用render把vnode渲染成真实的dom节点。
    const {render, h} = Vue

    // 生成vnode
    const vnode = h("p", {class: "pp"}, "运行时")

    // 挂载容器
    const container = document.getElementById("app")
    // 挂在虚拟dom
    render(vnode, container)
  </script>
```

```js
const vnode = {
  type: 'p',
  props: {
    class: 'pp'
  },
  children: '运行时'
}

function render(vnode) {
  const node = document.createElement(vnode.type)
  node.className = vnode.props.class
  node.innerHTML = vnode.children
  document.body.appendChild(node)
}

render(vnode)
```

对于 dom 渲染而言，可以分成两个部分

- 初次渲染，即挂载。
- 更新渲染，即打补丁。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd5c2ce75d2c41cc80f152f4d6da5018~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1376&h=500&s=44618&e=png&a=1&b=fe9d65)

可以查看 vue 官网的[渲染机制](https://cn.vuejs.org/guide/extras/rendering-mechanism.html)

## Vue 为啥要使用运行时加编译时

1．针对于纯运行时 而言：因为不存在编译器，所以我们只能够提供一个复杂的 JS 对象（难以编写）。即 Vnode 对象。

2．针对于 纯编译时 而言：因为缺少运行时，所以它只能把分析差异的操作，放到编译时进行，同样因为省略了运行时，所以速度可能会更快。但是这种方式这将损失灵活性。比如 svelte，它就是一个纯编译时的框架，但是它的实际运行速度可能达不到理论上的速度。

3．运行时＋编译时：比如 vue 或 react 都是通过这种方式来进行构建的，使其可以在保持灵活性的基础上，尽量的进行性能的优化，从而达到一种平衡。

## 副作用

副作用指的是：当我们对数据进行 setter 或 getter 操作时，所产生的一系列后果。

## vue 对 ts 支持友好

为了 vue 拥有良好的 ts 类型支持，vue 内部其实做了很多事情。定义了很多类型，所以我们编写 ts 才会很容易。并不是因为 vue 是 ts 写的。

## 写测试用例，调试，看源码

- 摒弃边缘情况。
- 跟随一条主线。

在我们测试打断点时，有很多边缘判断，我们只跟着条件为 true 的逻辑走。

fork vue3 仓库到自己的 github 仓库（可以将自己阅读源码的过程提交到自己的仓库下，方便以后查看），并克隆到本地。然后做一下操作

- 安装依赖
- 开启 sourcemap。`"build": "node scripts/build.js -s"`
- 打包构建
- 在`packages/vue/example/...`中编写测试用例，断点调试看源码。

[这里是我的仓库](https://github.com/zhang-glitch/vue3-core/tree/main)

## ts 配置项

```js
// https://www.typescriptlang.org/tsconfig
{
	// 编辑器配置
	"compilerOptions": {
		// 根目录
		"rootDir": ".",
		// 严格模式标志
		"strict": true,
		// 指定类型脚本如何从给定的模块说明符查找文件。
		"moduleResolution": "node",
		// https://www.typescriptlang.org/tsconfig#esModuleInterop
		"esModuleInterop": true,
		// JS 语言版本
		"target": "es5",
		// 允许未读取局部变量
		"noUnusedLocals": false,
		// 允许未读取的参数
		"noUnusedParameters": false,
		// 允许解析 json
		"resolveJsonModule": true,
		// 支持语法迭代：https://www.typescriptlang.org/tsconfig#downlevelIteration
		"downlevelIteration": true,
		// 允许使用隐式的 any 类型（这样有助于我们简化 ts 的复杂度，从而更加专注于逻辑本身）
		"noImplicitAny": false,
		// 模块化
		"module": "esnext",
		// 转换为 JavaScript 时从 TypeScript 文件中删除所有注释。
		"removeComments": false,
		// 禁用 sourceMap
		"sourceMap": false,
		// https://www.typescriptlang.org/tsconfig#lib
		"lib": ["esnext", "dom"],
		// 设置快捷导入
		"baseUrl": ".",
                // 路径别名
		"paths": {
              "@vue/*": ["packages/*/src"]
            }
	},
	// 入口
	"include": [
           "packages/*/src"
	]
}
```

> [项目初始化请访问这里](https://github.com/zhang-glitch/vue3_core_mini)

## vue3 与 vue2 的优势

- 性能更好
- 体积更小
- 更好的 ts 支持，vue 提供了很多的接口
- 更好的代码组织，更好的逻辑抽离。（hooks）

## 响应式

### vue2 Object.defineProperty 实现响应式

Object.defineProperty 缺陷

- vue2 中对 data 对象做深度监听一次性递归，性能较差。
- 由于 js 限制，无法监听新增、删除属性。需要使用`Vue.set, Vue.delete`
- 无法原生监听数组，需要特殊处理。重写了数组的一些方法，让其可以做到响应式。（`push()`，`pop()`，`shift()`，`unshift()`，`splice()`，`sort()`，`reverse()`） [具体看这里](https://v2.cn.vuejs.org/v2/guide/list.html#%E6%95%B0%E7%BB%84%E6%9B%B4%E6%96%B0%E6%A3%80%E6%B5%8B)

### vue3 Proxy 实现响应式

#### [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

handler 操作中的方法的 receiver 参数表示当前代理对象本身。

只有使用当前代理对象操作才会触发 handler 中对应的拦截方法。

#### [Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

Reflect 提供的方法（`get, set`）传入的 receiver 参数可以替换掉操作对象中的 this 值。

```js
Reflect.set(target, propertyKey, value[, receiver]) // receiver将作为target setter方法的this。防止target对象使用getter,setter获取和设置对象属性时，未使用代理对象，从而失去响应式。
```

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/501b5cd540f0477199ce7057a1c200c7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1163&h=849&s=433531&e=png&b=1e1e1e)

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3740c995e341405dad43e1428bd3296f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1107&h=845&s=472108&e=png&b=1e1e1e)
**`receiver`这个参数对于 vue 中的响应式实现具有非常重要的意义。因为只要是读取属性，我们就需要走代理对象，而不是原始对象。**

#### [WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)

WeakMap 引用的对象，是弱引用，并不阻止 js 的垃圾回收机制。

- 弱引用：不会影响垃圾回收机制。即：WeakMap 的 key 不再存在任何引用时，会被直接回收。

- 强引用：会影响垃圾回收机制。存在强引用的对象永远不会 被回收。

例如：在 vue 源码中使用在保存代理对象，如果当前对象以前被代理过，直接返回代理对象。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aea07a15011e443ca8dad477fe5eff53~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1189&h=626&s=130217&e=png&b=fcf5e1)
响应式依赖函数和对象以及对象属性映射的数据结构

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e672b3221b5b45c790e9b80ccf34b17b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1097&h=661&s=117458&e=png&b=fdf6e2)

## 响应式实现

### reactive

setter 执行依赖函数， getter 收集依赖函数。

#### reactive.ts

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05b9e25c05114a5387f78c8cd7f502cb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1165&h=583&s=94187&e=png&b=fefefe)
reactive 函数，返回 createReactiveObj(target, mutableHandlers, reactiveMap)。

createReactiveObj 返回一个 Proxy 实例。放在 WeakMap 中判断创建。

#### effect.ts

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4476a7db646242c1b3c45251367b443c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1162&h=671&s=744740&e=png&b=212325)
内部调用 ReactiveEffect 类的 run 方法首次触发，依赖收集。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d7016eb378646bcac4be02e9856a3cb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=862&h=803&s=82070&e=png&b=fefdfd)
ReactiveEffect 类接收 fn 作为参数。run 方法中将`activeEffect`全局变量赋值为 this。并执行 fn。如果有获取属性操作，就会触发 Proxy 的 getter 方法。

并触发 track, 定义 WeakMap 数据结构保存依赖函数。（每个对象每个属性都保存依赖收集函数）, trigger, 触发收集的依赖函数。**建立了 targetMap 和 activeEffect 之间的联系。**

#### baseHandlers.ts

定义 Proxy 操作方法，get（track）, set（trigger）等。

#### dep.ts

createDep 创建一个 set 对象。用于存储依赖函数。

#### 依赖收集和依赖触发数据结构

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f046abae23c6474a9b35b8d0c201c950~tplv-k3u1fbpfcp-watermark.image?)

```js
class Dep {
  constructor() {
    this.subscribers = new Set()
  }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  notify() {
    this.subscribers.forEach(effect => {
      effect()
    })
  }
}

let activeEffect = null
function watchEffect(effect) {
  activeEffect = effect
  effect()
  activeEffect = null
}

// Map({key: value}): key是一个字符串
// WeakMap({key(对象): value}): key是一个对象, 弱引用
const targetMap = new WeakMap()
function getDep(target, key) {
  // 1.根据对象(target)取出对应的Map对象
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 2.取出具体的dep对象
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

// vue2对raw进行数据劫持
function reactive(raw) {
  Object.keys(raw).forEach(key => {
    const dep = getDep(raw, key)
    let value = raw[key]

    Object.defineProperty(raw, key, {
      get() {
        // 将依赖函数传入到set中
        dep.depend()
        return value
      },
      set(newValue) {
        if (value !== newValue) {
          value = newValue
          // 调用该依赖相关的所有函数
          dep.notify()
        }
      }
    })
  })

  return raw
}

// vue3对raw进行数据劫持
function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const dep = getDep(target, key)
      dep.depend()
      return target[key]
    },
    set(target, key, newValue) {
      const dep = getDep(target, key)
      target[key] = newValue
      dep.notify()
    }
  })
}
```

#### 断点跟踪 vue 源码

reactive
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/374aa031d6ab440e9b0111408928e218~tplv-k3u1fbpfcp-watermark.image?)

createReactiveObject
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/43f63171fa3e41db93fca6109d32379d~tplv-k3u1fbpfcp-watermark.image?)
effect

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2c9df7ad76d46b98152e2998eb2e33a~tplv-k3u1fbpfcp-watermark.image?)

ReactiveEffect

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7c823df74c1046d1beb57cc21cfbdd95~tplv-k3u1fbpfcp-watermark.image?)

run
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3785ca5d7c4048d782609925b9662e17~tplv-k3u1fbpfcp-watermark.image?)
createGetter

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5e991133f32d4575919c0eff87175f11~tplv-k3u1fbpfcp-watermark.image?)

track

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bc9b55b1a35c422c870551c43925fd7d~tplv-k3u1fbpfcp-watermark.image?)
createSetter

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0926bdd5144943ffb0c596cd5ce5afba~tplv-k3u1fbpfcp-watermark.image?)
trigger

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c8b1c09a609452ca8fd152b69809b09~tplv-k3u1fbpfcp-watermark.image?)
当我们修改代理对象中的属性，我们间接的在代理对象的 set 拦截器中修改了被代理对象的属性值。所以代理和被代理对象是同步的。

#### reactive, effect 实现思路

调用 reactive（返回 proxy 代理对象） > 在 effect 中创建 ReactiveEffect 实例 > 调用 run 方法（触发 effect 传入的回调，有代理对象的 getter 操作） > 触发代理对象的 get 方法（track 函数收集依赖） > 收集对象对应的属性对应的 activeEffect 函数 > 触发代理对象的 set 方法（有代理对象的 setter 操作） > 触发对象对应的属性对应的 activeEffect 函数。

[reactive 实现请访问这里](https://github.com/zhang-glitch/vue3_core_mini/tree/reactive-effect)

#### reactive 局限性

- 不能处理基本数据类型。因为 Proxy 代理的是一个对象。
- 不能进行解构，结构后将失去响应性。因为响应性是通过代理对象进行处理的。结构后就不存在代理对象了，因此就不具备响应式了。

### ref

#### 测试用例

```js
const { ref, effect } = Vue

const obj = ref({
  name: 'zh'
})

effect(() => {
  // 先触发ref的 getter 行为 （触发trackValue触发ref的依赖收集，放在ref实例的dep中，当ref对象直接修改时，直接触发get value进行依赖函数执行）
  // value.name 又触发代理对象的 getter 行为 （这个是将effect回调和代理对象的 key 进行绑定的）
  document.getElementById('app').innerHTML = obj.value.name
})

setTimeout(() => {
  // 先触发ref的 getter 行为
  // value.name 又触发代理对象的 setter 行为
  obj.value.name = 'oop'
}, 1000)
```

#### 断点跟踪 vue 源码

- RefImpl 类创建一个 ref 实例。
- RefImpl 中判断当传入的是否是一个对象，是则直接调用 reactive 做响应式。将其代理对象赋值给 ref 对象的`_value`属性保存。
  ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7801c70e7233435da6dd19fd1790e0c1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1272&h=846&s=146264&e=png&b=fcf5e2)
- RefImpl 中提供`get value`,`set value`方法。在我们处理（读取 value 属性和为 value 属性赋值）ref 对象时，就会调用对应的方法进行依赖收集和依赖触发。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7fd2fc8137f044db9a67942ebee61139~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1142&h=524&s=115500&e=png&b=fdf6e3)

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/febbe951b10a4088b4bbf0300151d24e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1718&h=814&s=178204&e=png&b=fefcfc)

然后`obj.value.name`又会触发代理对象 name 属性的依赖收集。

#### 总结

**obj.value 就是一个 reactive 返回的代理对象** ，这里并没有触发 set value。不管是对复杂数据类型赋值还是读值，他都值触发 refImpl 实例的 get value。

**但是对于简单数据类型就不一样了。** 构建简单数据类型时，**他并不是通过代理对象去触发依赖收集和依赖触发的。而是通过 refImpl 中的 get value set value 主动去收集依赖和触发依赖的，这就是为啥 get value 中的 trackValue 将依赖收集到 ref 实例的 dep 中的原因。**

**ref 复杂数据类型**

- 对于 ref 函数，会返回 RefImpl 类型的实例

- 在该实例中，会根据传入的数据类型进行分开处理

  - 复杂数据类型：转化为 reactive 返回的 proxy 实例。在获取`ref.value`时返回的就是 proxy 实例。

  - 简单数据类型：不做处理

- 无论我们执行 obj.value.name, 还是 obj.value.name ＝ xxx, 本质上都是触发了 get value。

- 响应性 是因为 obj.value 是一个 reactive 函数生成的 proxy

**ref 简单数据类型**

我们需要知道的最重要的一点是：**简单数据类型，不具备数据件监听的概念，即本身并不是响应性的。**

只是因为 vue 通过了 set value（）的语法，把 函数调用变成了属性调用的形式，让我们通过主动调用该函数，来完成了一个“类似于”响应性的结果。

我们就知道了网上所说的，ref 的响应性就是将其参数包裹到 value 中传入 reactive 实现的，了解了这些，我们就可以大胆的说扯淡了。

### 计算属性 computed

计算属性 computed 会基于其响应式依赖被缓存，并且在依赖的响应式数据发生变化时重新计算。

计算属性也是一个 ref 对象。

#### 测试用例

```js
  <div id="app"></div>
  <script>
    const { computed, reactive, effect } = Vue;

    const obj = reactive({
      name: "zh"
    })


    const computedObj = computed(() => {
      return "执行" + obj.name
    })

    effect(() => {
      // 触发ComputedRefImpl 的 get value
      document.getElementById("app").innerHTML = computedObj.value
    })

    setTimeout(() => {
      obj.name = "llm"
    }, 2000)
  </script>
```

我们先来介绍一下执行流程，再看断点调试。

- 上来先执行 computed，创建一个 computedRef 对象。（所有 computed 对象都是 Ref 对象）
- 初始化 computedRef 对象时，创建一个`ReactiveEffect`对象。并将 computed 的 getter 函数传入。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/609b35b0b831440eaf2fe8b94dd966cb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1207&h=772&s=148912&e=png&b=fcf5e2)

- 然后执行 effect，创建`ReactiveEffect`对象,并将`effect`回调传入。
- 然后`computedObj.value`触发 computed 对象的 get value, 收集执行 effect 创建的`ReactiveEffect`对象。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3dddb7ea9cec48a8aeba68b9d8442556~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1352&h=625&s=177421&e=png&b=fcf5e1)

- 通过`_dirty`变量控制 computed 的 getter 执行，触发 reactive 对象的 getter 方法，收集依赖（**收集的是创建 computedRef 对象时内部创建的`ReactiveEffect`对象**）。（这里非常重要的一点，只要触发 computed get value 就有可能重新执行 computed 的 getter）
- 2s 后，触发 reactive 对象的 setter 方法，触发依赖执行。**这里就需要注意了。由于触发的是 computedRef 对象时内部创建的`ReactiveEffect`对象，上面挂载的有 computed，并且有`scheduler`调度器，所以会先执行含有 computed 属性的依赖具有`scheduler`调度器的依赖。**

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d8be71836bac43a7b7f5bf95e77efb17~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=970&h=863&s=110959&e=png&b=fcf5e2)

- 执行调度器，调度器中触发 computed 对象 get value 收集的依赖。此时`document.getElementById("app").innerHTML = computedObj.value`执行，又触发 computed get value, 执行 computed 的 getter 方法，返回修改的值。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d72f804e27f4f6e8fa412383a20dec8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1263&h=759&s=157641&e=png&b=fcf5e1)

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9126edcc815d4fd1801688ec2d9ce1fb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1553&h=702&s=142123&e=png&b=fefdfd)

#### 断点调试

- 初始化 computed

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e3cf758641f48fe9e223bbbcdd63666~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1609&h=857&s=185473&e=png&b=fdfbfb)

- 触发 computed get value，进行依赖收集，并执行 computed 传入的 getter 方法

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0306c0bacf7440486e8de7f139561fe~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1640&h=800&s=163790&e=png&b=fefdfd)

- 2s 后触发 reactive setter,然后触发依赖函数。此时该依赖有 computed 对象，所以调用`scheduler`调度器

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/190b8a5a80414267916077a211228713~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1636&h=869&s=203616&e=png&b=fdfbfb)

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0d6ee8be34e944668659e3bcb81c87f6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1652&h=858&s=190372&e=png&b=fdfbfb)

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0abd912848c64ae6a4e6b870dd4c8934~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1640&h=876&s=182317&e=png&b=fefefe)

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31aa7cee8c974745b0bd30139586b4c6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1631&h=878&s=204527&e=png&b=fefcfc)

- 触发 effect 回调，又会触发 computed 对象的 get value。获取最新值。**这里需要注意，虽然 2s 后触发了 reactive 的 setter 方法，但是并没有在 trigger 中直接执行 computed 的 getter 函数，而是通过再次触发 computed get value 通过`_dirty`变量来控制 getter 的触发的。**

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d18f7626d8884a4faf7d976edafe96ce~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1584&h=873&s=179412&e=png&b=fdfcfc)

#### 总结

- 创建 computedRefEmpl 实例，内部通过\_dirty 变量判断是否触发依赖。触发依赖放在 ReactiveEffect 的调度器中执行，这样就可以区分普通的响应式数据和 computed 响应式数据执行了。**并且先去触发 computed 的依赖函数，再去触发普通响应数据的依赖函数。(这样是为了做到 computed 缓存的)**
- 获取 computed 变量时，触发 get value 执行，然后收集依赖。并执行传入的依赖 getter。并修改`_dirty`为 false，如果依赖数据未变化，那么它将返回缓存的值。

只要修改响应式数据，就会触发调度器执行，然后`_dirty`设置为 false，然后就会再次重新执行 getter，拿到最新值。

## watch

### 测试用例

```js
const { watch, reactive, effect } = Vue

const obj = reactive({
  name: 'zh'
})

watch(obj, val => {
  console.log('val', val)
})

setTimeout(() => {
  obj.name = 'llm'
}, 2000)
```

- 调用 watch，创建`ReactiveEffect`对象。
  ![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab5dbf0110c946fa9f46a72b1af4519c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1395&h=866&s=231820&e=png&b=fcf5e2)
- watch 依赖收集
  ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4441eda831db4877b0e0b7d0788d7384~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1295&h=208&s=41530&e=png&b=fcf5e2)
- 执行 getter，拿到值，赋值给 oldValue 保存
  ![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8d25c4ab035549a591a4b6f62ffa286a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=753&h=594&s=64924&e=png&b=fcf5e1)
- 2s 后触发 reactive 的 setter 方法，触发依赖，依赖是具有 scheduler 的，所以执行调度器，即 job 函数。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fd2dad179fc14567ab61319e8596b32c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1259&h=834&s=153499&e=png&b=fcf5e2)

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/22cbb92c31084ce18f2c929832cfadef~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1138&h=877&s=122842&e=png&b=fcf5e1)

- 触发 watchCallback
  ![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/febdd233f9e0455b9c78bc23ceb66843~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1158&h=899&s=115665&e=png&b=fcf5e2)

这里需要注意一下，监听对象的变化，我们获取新旧值是一样的，经过上面的分析我们就可以看出，因为 oldValue 是执行 ReactiveEffect 中的 fn 返回的，它返回的是一个对象类型。新值也是这个对象，所以 setter 修改时，引用不变，所以新旧值是一样的。

### 断点调试

- 调用 doWatch 函数执行初始化 watch

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cbb1f1f479904de8a2866f27190af3eb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=934&h=691&s=94015&e=png&b=fefdfd)

- 进行判断，如果是 reactive 对象，那么就深度监听。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/602efc76e6694967817f2336a0cb6688~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=865&h=791&s=90000&e=png&b=fefdfd)

- 对象，递归调用，触发依赖收集

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17214ab20ff4451ab55972ad0f3ab492~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1099&h=834&s=135992&e=png&b=fdfcfc)

- 定义 job 函数
  ![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/72f9297ef16046e38fc61b5991707393~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=823&h=787&s=79263&e=png&b=fefefe)
- 初始化 ReactiveEffect 对象和调度器。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d9a1b514e0064e1fa6c1855d4191c326~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=863&h=800&s=111423&e=png&b=fefefe)

**任何关于响应式的 api 内部都离不开`ReactiveEffect`类的初始化，他就是通过 Proxy get 拦截器收集`ReactiveEffect`对象作为依赖，在触发 Proxy set 拦截器时，查看是否有`scheduler`回调（computed 触发 get value 的回调，watch 第二个参数），如果有就执行，没有就执行普通的响应式回调。**

[watch 实现代码](https://github.com/zhang-glitch/vue3_core_mini/tree/watch-scheduler)

## 调度器 Scheduler

- 控制代码执行顺序。

```js
const { reactive, effect } = Vue

const obj = reactive({
  age: 1
})

effect(
  () => {
    console.log('=======', obj.age)
  },
  {
    scheduler() {
      setTimeout(() => {
        console.log('=======', obj.age)
      })
    }
  }
)

obj.age = 2
console.log('执行结束！')
```

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/772148f199da4c849359e8a7140a1d9f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=788&h=280&s=12959&e=png&b=fefefe)
由上图可知，执行结束先于`=====,2`输出。

- 控制代码执行逻辑。

```js
const { reactive, effect, queuePostFlushCb } = Vue

const obj = reactive({
  age: 1
})

effect(
  () => {
    console.log('=======', obj.age)
  },
  {
    scheduler() {
      queuePostFlushCb(() => {
        console.log('=======', obj.age)
      })
    }
  }
)

obj.age = 2
obj.age = 3
console.log('执行结束！')
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97a9415264f3452a8b69bbdccba1fdc3~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=907&h=325&s=14189&e=png&b=ffffff)
由上图可知，跳过了`obj.age = 2`的 setter 逻辑触发。

经过前面的分析，我们发现，scheduler 对于计算属性和 watch 是非常重要的。

## 前置知识

运行时

- h 函数生成 vnode。
- render 函数渲染 vnode，生成真实的 dom。

[dom 树](https://zh.javascript.info/dom-nodes)

runtime-core 和 runtime-dom 分开编写的原因： 不同的宿主环境使用不同的 api。runtime-core 只涉及运行时核心代码。暴露出统一的接口，让不同宿主环境定制化。

因为 vue 中在做一些标记计算时，大量使用到位运算，所以我们需要了解一些基础的 [位运算](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_Operators#%E4%BD%8D%E8%BF%90%E7%AE%97%E7%AC%A6)。

- `左移 a << b`: 表示 a 乘以 2 的 b 次方
- `右移 a >> b`: 表示 a 除以 2 的 b 次方，小于 1 的都为 0。

```js
1 << 2
4
1 >> 2
0
1 >> 4
0
2 >> 4
0
```

- [`无符号右移 (左边空出位用 0 填充)`](https://blog.csdn.net/fengqing5578/article/details/88224394#:~:text=%E6%80%BB%E7%BB%93%EF%BC%9A%E6%AD%A3%E6%95%B0%E7%9A%84%E5%B7%A6%E7%A7%BB%E4%B8%8E%E5%8F%B3%E7%A7%BB%EF%BC%8C%E8%B4%9F%E6%95%B0%E7%9A%84%E6%97%A0%E7%AC%A6%E5%8F%B7%E5%8F%B3%E7%A7%BB%EF%BC%8C%E5%B0%B1%E6%98%AF%E7%9B%B8%E5%BA%94%E7%9A%84%E8%A1%A5%E7%A0%81%E7%A7%BB%E4%BD%8D%E6%89%80%E5%BE%97%EF%BC%8C%E5%9C%A8%E9%AB%98%E4%BD%8D%E8%A1%A50%E5%8D%B3%E5%8F%AF%E3%80%82,%E8%B4%9F%E6%95%B0%E7%9A%84%E5%8F%B3%E7%A7%BB%EF%BC%8C%E5%B0%B1%E6%98%AF%E8%A1%A5%E7%A0%81%E9%AB%98%E4%BD%8D%E8%A1%A51%2C%E7%84%B6%E5%90%8E%E6%8C%89%E4%BD%8D%E5%8F%96%E5%8F%8D%E5%8A%A01%E5%8D%B3%E5%8F%AF%E3%80%82): 正数和`a >> b`效果是一样的，但是负数就不一样了。
- `按位与 a & b`: 表示 a、b 二进制**对应位置全部为 1**,就为 1。然后再转为 10 进制。

```js
15 & 9 = 1111 & 1001 = 1001 = 9
```

- `按位或 a | b`: 表示 a、b 二进制**对应位置只要有一位为 1**,就为 1。然后再转为 10 进制。

```js
15 | 9 = 1111 | 1001 = 1111 = 15
```

- `按位异或 a ^ b`: 表示 a、b 二进制**对应位置二进制都不一样**。才为 1。然后再转为 10 进制。

```js
15 | 9 = 1111 | 1001 = 0110 = 6
```

- `按位非 ~a`: ~~表示将 a 二进制对应位置反位。(0 改成 1,1 改成 0)，然后转为 10 进制。~~ **注意位运算符“非”将所有的 32 位取反，而值的最高位 (最左边的一位) 为 1 则表示负数** 因为 32 位最后一位表示符号。 计算秘诀就是**值 + 1**取反（正数变负数，负数变正数）。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2b100f92c8b54ef2b86709caae650e70~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1027&h=340&s=255937&e=png&b=f6f6f6)

```js
// 我以为的
~15 = ~1111  = 0000 = 0
// -（原值 + 1）
~15 = -16
```

**话说看完这些我已经有点晕了。记住`>> 、<<、| 、 &`即可。**

## h

### h 函数参数处理，调用 createVNode 函数

类似于适配器模式，主要是处理参数的差异，然后调用 createVNode 函数创建 VNode。**注意 h 函数不是只能传递三个参数，他会将三个参数往后的都作为 children。**

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b502615ed7054d94b958fb78080beb6e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1198&h=887&s=207846&e=png&b=fcf5e1)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a50dff09f11c4be0984b5ea64c1646b8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1247&h=651&s=99838&e=png&b=fefafa)

### 调用 createVnode 时，我们需要做了一些优化。

#### [动态节点做标记 patchFlag](https://template-explorer.vuejs.org)

- 标记区分不同的类型。
- diff 算法时，可以区分静态节点（不做处理），以及不同类型的动态节点。
  ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aec844a9cbc6417ba5771e8a0e1427ef~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1875&h=518&s=89626&e=png&b=1e2022)
  vue2、3 模板编译时进行优化对比
  ![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e4bdc325e414a05995b87cfe74fa0fa~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=569&h=543&s=170035&e=png&b=faf7f7)

#### [静态节点提升作用域 hoistStatic](https://template-explorer.vuejs.org)

- 将静态节点的定义提升到父级作用域缓存起来。
- 多个相邻的静态节点会被合并起来，作为一个静态的 html 模板

这种优化是一个典型的空间换时间的优化。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b935b677aa3c4281bfed7b540fcae350~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1905&h=885&s=196228&e=png&b=1d1f21)

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fda6f58131074b65bc4ee6530fac7ae6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1900&h=864&s=162514&e=png&b=1d1f21)

#### [事件缓存 cacheHandler](https://template-explorer.vuejs.org)

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/659dadf0a8e4446887b01b92cc10c441~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1894&h=784&s=62327&e=png&b=1d1f21)

#### 标记节点类型 shapeFlag（父节点和子节点）

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c669cd1da4c542e8a1c2276cdbc2c8ae~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1536&h=748&s=388206&e=png&b=fbf4e1)

### `createVNode，createBaseVNode`基本逻辑，最终输出标准 vnode

- 处理 type 传入的类型,赋值，然后通过 children 的类型和 type 的类型`按位或`算出 shapeFlag。
  - element + string children = 9
  - element + array chidlren = 17

第一次赋值区分`字符串，组件，Text, Fragment, Comment, Suspense, Teleport`等类型。其中 Text, Comment, Fragment 类型都是 Vue 内置的类型，都是 Symbol 类型。使用时需要导入。
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/85c7229b9b494e098fb22786a43b0922~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1194&h=498&s=120542&e=png&b=fdf6e3)
第二次赋值区分 children 的类型值。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/623543bdb9bf4a759d04d058712c856d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1061&h=804&s=132469&e=png&b=fcf5e2)

- 标准化 props(normalizeClass, normalizeStyle)，处理 class, style 增强写法。
- 标准化 children(normalizeChidlren)，然后赋值给 VNode 对象。

**通过断点调试发现，vnode 的生成是先执行 children 的 h 函数，再执行外部的 h 函数。**

h 函数的执行还是比较简单的，主要就是上面所讲到的问题，搞清楚就没啥问题了。

[h 函数代码实现](https://github.com/zhang-glitch/vue3_core_mini/tree/h)

## render

- 判断是挂载还是更新。
- 生成 dom 元素。
- 生成 dom 元素内容。
- 处理 props，将其挂载到 dom 对应的属性上。（这里都标准化了在 h 函数阶段）。
- 将 dom 元素插入到指定的根元素中。
- 将 vnode 对象放在当前根元素之中。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/de9c2fbb9e334216b1e106345d06a373~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=964&h=259&s=71605&e=png&b=fdf6e0)
看了一下源码，非常的复杂，暴露出一个 createApp 函数，回调了很多个函数。在源码实现的时候需要注意一下事项

- 在组件挂载后，我们一定要将当前 vnode 赋值给挂载的根节点`_vnode`属性，他是后续作为 oldVNode 传递的。

```js
const render = (vnode: VNode, container) => {
  if (vnode == null) {
    // TODO: 卸载
  } else {
    // 打补丁patch / mount
    patch(container._vnode, vnode, container)
  }
  // 将当前vnode赋值给container._vnode作为旧节点
  container._vnode = vnode
}
```

- 在当前组件挂载后，我们需要将创建出来的 dom 元素赋值给 vnode 的`el`这样作为下次更新时，节点挂载的根对象。

```js
const mountElement = (vnode, container, anchor) => {
    const { type, props, shapeFlag } = vnode

    // 创建 element
    const el = (vnode.el = hostCreateElement(type))

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 设置 文本子节点
      hostSetElementText(el, vnode.children as string)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 设置 Array 子节点
      mountChildren(vnode.children, el, anchor)
    }

    // 处理 props
    if (props) {
      // 遍历 props 对象
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    // 插入 el 到指定的位置
    hostInsert(el, container, anchor)
  }
```

- 我们在 dom 更新时，需要取出挂载时赋值给`oldVNode.el`的根对象，并赋值给`newVNode.el`，让其设置 children 和 props 时使用。

```js
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
```

### 挂载 element + text children

- path
- 根据 type 和 shapeFlag 来决定怎么处理挂载, 这里是通过**processElement**。
- 根据是否有 oldVnode,来决定是挂载**mountElement**还是更新**patchElement**。
- 内部去创建元素 **hostCreateElement**, 创建 text **hostSetElementText**, 再去处理 props **hostPatchProp**, 最后是将元素插入到 container 中 **hostInsert**。

```js
 const patch: PatchFn = (
    n1,
    n2,
    container,
    anchor = null,
    parentComponent = null,
    parentSuspense = null,
    isSVG = false,
    slotScopeIds = null,
    optimized = __DEV__ && isHmrUpdating ? false : !!n2.dynamicChildren
  ) => {
    if (n1 === n2) {
      return
    }

    // patching & not same type, unmount old tree
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1)
      unmount(n1, parentComponent, parentSuspense, true)
      n1 = null
    }

    if (n2.patchFlag === PatchFlags.BAIL) {
      optimized = false
      n2.dynamicChildren = null
    }

    const { type, ref, shapeFlag } = n2
    switch (type) {
      case Text: // 挂载文本节点
        processText(n1, n2, container, anchor)
        break
      case Comment:
        processCommentNode(n1, n2, container, anchor)
        break
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, isSVG)
        } else if (__DEV__) {
          patchStaticNode(n1, n2, container, isSVG)
        }
        break
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        )
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) { // 挂载原生节点
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          )
        } else if (shapeFlag & ShapeFlags.COMPONENT) { // 挂载组件节点
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          )
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          ;(type as typeof TeleportImpl).process(
            n1 as TeleportVNode,
            n2 as TeleportVNode,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized,
            internals
          )
        } else if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
          ;(type as typeof SuspenseImpl).process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized,
            internals
          )
        } else if (__DEV__) {
          warn('Invalid VNode type:', type, `(${typeof type})`)
        }
    }

    // set ref
    if (ref != null && parentComponent) {
      setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2)
    }
  }
```

### 更新 element + text children

- **patchElement**。
- 内部进行 children 比较。**patchChildren**，判断 vNode 第三个参数是否是数组还是字符串，分情况比较。然后再进行 props 的比较， **patchProps**。

```js
 // children has 3 possibilities: text, array or no children.
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // text children fast path
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1 as VNode[], parentComponent, parentSuspense)
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2 as string)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // prev children was array
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // two arrays, cannot assume anything, do full diff
          patchKeyedChildren(
            c1 as VNode[],
            c2 as VNodeArrayChildren,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          )
        } else {
          // no new children, just unmount old
          unmountChildren(c1 as VNode[], parentComponent, parentSuspense, true)
        }
      } else {
        // prev children was text OR null
        // new children is array OR null
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(container, '')
        }
        // mount new if array
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(
            c2 as VNodeArrayChildren,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          )
        }
      }
    }
  }
```

### 不同节点的 element 更新时

通过`isSameVNodeType`比较其类型和 key 值是否相同。**不同就卸载旧节点。然后就将旧的 vNode 赋值为 null。由于旧节点被设置为空，所以就将新节点挂载。**

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2e10d959f34144508efb1d7cec5e5567~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1070&h=476&s=117563&e=png&b=292d35)

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/36dd5956c7544a47a6b7e5cbeee2cfac~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1014&h=239&s=65542&e=png&b=2a2e36)

### patchProps 非事件 props 的挂载

- class。 直接通过`el.className`设置就可。
- style。通过 style.setProperty。并且会处理 css 兼容。autoPreFix。
  ```js
  const prefixes = ['Webkit', 'Moz', 'ms']
  ```
- value。通过`el.value`设置即可。
- 其他属性。通过`el.setAttribute()`设置。

**之所以区别挂载，是因为 dom 对象的属性和 html 元素的 attr 是不一样的概念。**

在设置完新 vNode 的 props 后，它将再次遍历旧 Vnode，删除新 Vnode 不存在的属性。

### patchProps 事件 props 的挂载

**这个和之前的属性不一样，这个会通过`vei`对象进行事件缓存。将事件缓存在`vei.value`中。对于事件的更新直接修改 value 就行，而不是通过调用`addEventListener，removeEventListener`频繁的创建和移除。**

```js
export function patchEvent(
  el: Element & { _vei?: Record<string, Invoker | undefined> },
  rawName: string,
  prevValue: EventValue | null,
  nextValue: EventValue | null,
  instance: ComponentInternalInstance | null = null
) {
  // vei = vue event invokers
  const invokers = el._vei || (el._vei = {})
  const existingInvoker = invokers[rawName] // 缓存事件
  if (nextValue && existingInvoker) {
    // patch
    existingInvoker.value = nextValue
  } else {
    const [name, options] = parseName(rawName) // 处理事件名称
    if (nextValue) {
      // add
      const invoker = (invokers[rawName] = createInvoker(nextValue, instance))
      addEventListener(el, name, invoker, options)
    } else if (existingInvoker) {
      // remove
      removeEventListener(el, name, existingInvoker, options)
      invokers[rawName] = undefined
    }
  }
}
```

### 无状态组件挂载（element + text children 组件）

- 初始化组件，createComponentInstance。组件实例中 vnode 属性绑定当前组件的 vnode,vnode 对象中的 component 属性绑定组件实例。
  ![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9ab570e462748c19abf3f9a2c42fc25~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1149&h=413&s=108994&e=png&b=292d35)
- 初始化组件一系列数据。setupComponent
  - 有状态组件，执行 setupStatefulComponent,如果有 setup 将被调用。如果没有 setup 我们将执行 finishComponentSetup（给组件实例 render 赋初值）

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cbaee8dc046d4102888cc040e18fac1a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1025&h=544&s=118861&e=png&b=292d35)

- setupRenderEffect，为组件实例 effect 属性赋值 ReactiveEffect 对象。**这个对象将是以后触发状态更新时更新组件渲染视图的关键。**
  ![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/76807d3fa6ce4922a2bf5c97e2263c38~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1079&h=857&s=144735&e=png&b=292d35)
  其中内部生成组件的 vnode 对象进行挂载。
  ![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a765ce8d85024a179309cd5afacf7f7e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1058&h=590&s=56919&e=png&b=fdf6e3)
  ![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/849ed1d50ecc4cb5a0b918e639710675~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1100&h=909&s=94412&e=png&b=fcf5e2)

### 无状态组件更新 （element + text children 组件）

其实就是卸载原来组件，重新挂载组件。（这是简单的分析来说的，如果同一个 type 并且 key 相同就需要 diff 了）

### 有状态组件挂载（element + text children 组件）

其他逻辑和无状态组件挂载一样，在初始化组件实例（setupComponent）时，需要处理状态数据，将其转换成响应式数据。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ebbaf7e550b4137a133d3f27c9ae122~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1116&h=613&s=684814&e=png&b=202224)

### 有状态组件更新（element + text children 组件）

其实就是卸载原来组件，重新挂载组件。（这是简单的分析来说的，如果同一个 type 并且 key 相同就需要 diff 了）

### 生命周期

#### setupComponent 中直接执行

- beforeCreate 是在 options 选项处理之前调用的。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/527688f667224766870b1f3ac1c07a92~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1272&h=850&s=134414&e=png&b=fcf5e1)

- created 是在一些数据处理 options 处理完毕后执行的。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d6135eaabdf4db884bd0f67224052c1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1132&h=934&s=130713&e=png&b=fcf5e1)

#### 通过注册，等待时机执行

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7cfb8bf9bc894bb1973f99d65dfdbe38~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1076&h=474&s=111279&e=png&b=fdf6e2)

- beforeMount，mounted 是在组件更新时触发的。
  ![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/581883c2cf484b9cbd63e9533c57edf1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1689&h=978&s=265656&e=png&b=faf3e0)
- beforeUpdate，updated 是在组件更新时触发的。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19d7ed71772548158b5f18f5f2bf2c76~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1015&h=947&s=94537&e=png&b=fcf5e1)

### setup 函数挂载与更新

本质上就是在 setupComponent（初始化组件实例属性）中判断是否有 setup，如果有将执行并将 setup 返回值作为组件实例 render 属性的值。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ea01a11f5bff4b80b7735f7776030c2d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1282&h=928&s=170631&e=png&b=fcf5e1)

[运行时源码简单实现](https://github.com/zhang-glitch/vue3_core_mini/tree/render)

### diff算法分析

在vue中如果想要进行diff算法对比，那么oldVNode和newVNode就必须具有相同的type和key。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/faef99431ca9456c8d7df610649994a0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1234&h=553&s=128014&e=png&b=fcf5e2)
#### 情况一（自前向后比较新旧节点）
自前向后比对对应位置的新旧vnode。如果type和key相同则直接进行patch。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4537a560f98342c883fe2c57112d1cbd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=973&h=864&s=112943&e=png&b=fcf5e2)
#### 情况二（自后向前比较新旧节点）
自后向前对比对应位置的新旧vnode,如果type和key相同则直接进行patch。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a0a7a6851b64411ae6aec0c2892b66b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=830&h=856&s=101812&e=png&b=fdf7e3)
#### 情况三（新节点多于旧节点）
新节点多于旧节点，这里会有两种情况
- 新节点多于旧节点的内容在前面
- 新节点多于旧节点的内容在后面

**这两种情况的区别就是，在前面需要获取到旧节点第一个vnode作为锚点，将新内容插入到他之前。**

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5bf15192e3c94289bc6ee03956c03d5a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1127&h=847&s=113547&e=png&b=fcf6e2)
#### 情况四（旧节点多于新节点）
旧节点多于新节点，直接删除多余的旧节点。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/77deba4537724608959403c5be3c6c9f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1128&h=522&s=62609&e=png&b=fdf6e3)
#### 情况五（乱序节点）
新旧节点乱序情况下的diff，该diff使用到了最长递增子序列的算法。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eee330bf05bb4c1f825e522681ee634c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1289&h=654&s=259551&e=png&b=fefefe)
**找出最长递增子序列就是为了能更少的移动节点的顺序。**

通过map对象保存新Vnodes节点key与index的映射。
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/42053733888d4a62ae0b01f1135d2e04~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1255&h=750&s=161965&e=png&b=fcf5e2)

将新节点和旧节点下标进行一一映射，然后循环旧节点，在map对象中查找对应的key。尝试进行patch或者remove旧节点。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fbfc7e21778f44afbc6d9c7e6d1b59dd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1833&h=810&s=269382&e=png&b=fcf6e2)

循环未修补节点次数，进行移动或者挂载单独新节点或者移动节点到达指定位置。
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a945a60c017641a9b0c8e9f5ffddf263~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1112&h=862&s=126541&e=png&b=fcf5e2)

