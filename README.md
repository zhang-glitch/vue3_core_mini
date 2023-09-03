# vue3_core_mini
分析vue3源码后，实现的一个小型vue3
# 基础知识
## 命令式
详细描述做事的过程。**关注过程的一种编程范式**，他描述了完成一个功能的详细逻辑与步骤。
## 声明式
**不关注过程，只关注结果的范式。** 并不关心完成一个功能的详细逻辑与步骤。

- 命令式的性能 > 声明式的性能
- 命令式的可维护性 < 声明式的可维护性 （对于用户来说）

所以框架的设计过程其实是一个不断在可维护性和性能之间进行取舍的过程。在保证可维护性的基础上，尽可能的减少性能消耗。

**Vue封装了命令式的逻辑，而对外暴露出了声明式的接口。**

## 编译时 compiler
**把template中的html编译成render函数。**
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
**运行时可以利用render把vnode渲染成真实的dom节点。** 

render函数就是挂载h函数生成的虚拟dom。提供的render属性函数是用来生成虚拟dom树的。（vue2的render option, vue3 setup返回一个函数, comple(template)编译器生成的）
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
  type: "p",
  props: {
    class: "pp"
  },
  children: "运行时"
}

function render(vnode) {
  const node = document.createElement(vnode.type)
  node.className = vnode.props.class
  node.innerHTML = vnode.children
  document.body.appendChild(node)
}

render(vnode)
```

对于dom渲染而言，可以分成两个部分
- 初次渲染，即挂载。
- 更新渲染，即打补丁。


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd5c2ce75d2c41cc80f152f4d6da5018~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1376&h=500&s=44618&e=png&a=1&b=fe9d65)

可以查看vue官网的[渲染机制](https://cn.vuejs.org/guide/extras/rendering-mechanism.html)
## Vue为啥要使用运行时加编译时
1．针对于纯运行时 而言：因为不存在编译器，所以我们只能够提供一个复杂的 JS对象（难以编写）。即Vnode对象。

2．针对于 纯编译时 而言：因为缺少运行时，所以它只能把分析差异的操作，放到编译时进行，同样因为省略了运行时，所以速度可能会更快。但是这种方式这将损失灵活性。比如 svelte，它就是一个纯编译时的框架，但是它的实际运行速度可能达不到理论上的速度。

3．运行时＋编译时：比如 vue 或 react 都是通过这种方式来进行构建的，使其可以在保持灵活性的基础上，尽量的进行性能的优化，从而达到一种平衡。
## 副作用
副作用指的是：当我们对数据进行 setter或 getter 操作时，所产生的一系列后果。
## vue对ts支持友好
为了vue拥有良好的ts类型支持，vue内部其实做了很多事情。定义了很多类型，所以我们编写ts才会很容易。并不是因为vue是ts写的。
## 写测试用例，调试，看源码
- 摒弃边缘情况。
- 跟随一条主线。

在我们测试打断点时，有很多边缘判断，我们只跟着条件为true的逻辑走。

fork vue3仓库到自己的github仓库（可以将自己阅读源码的过程提交到自己的仓库下，方便以后查看），并克隆到本地。然后做一下操作
- 安装依赖
- 开启sourcemap。`"build": "node scripts/build.js -s"`
- 打包构建
- 在`packages/vue/example/...`中编写测试用例，断点调试看源码。

[这里是我的仓库](https://github.com/zhang-glitch/vue3-core/tree/main)
## ts配置项
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
## vue3与vue2的优势
- 性能更好
- 体积更小
- 更好的ts支持，vue提供了很多的接口
- 更好的代码组织，更好的逻辑抽离。（hooks）
## 响应式
### vue2 Object.defineProperty实现响应式

Object.defineProperty缺陷
- vue2中对data对象做深度监听一次性递归，性能较差。
- 由于js限制，无法监听新增、删除属性。需要使用`Vue.set, Vue.delete`
- 无法原生监听数组，需要特殊处理。重写了数组的一些方法，让其可以做到响应式。（`push()`，`pop()`，`shift()`，`unshift()`，`splice()`，`sort()`，`reverse()`） [具体看这里](https://v2.cn.vuejs.org/v2/guide/list.html#%E6%95%B0%E7%BB%84%E6%9B%B4%E6%96%B0%E6%A3%80%E6%B5%8B)
### vue3 Proxy实现响应式
#### [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
handler操作中的方法的receiver参数表示当前代理对象本身。

只有使用当前代理对象操作才会触发handler中对应的拦截方法。

#### [Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
Reflect提供的方法（`get, set`）传入的receiver参数可以替换掉操作对象中的this值。
```js
Reflect.set(target, propertyKey, value[, receiver]) // receiver将作为target setter方法的this。防止target对象使用getter,setter获取和设置对象属性时，未使用代理对象，从而失去响应式。
```
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/501b5cd540f0477199ce7057a1c200c7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1163&h=849&s=433531&e=png&b=1e1e1e)

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3740c995e341405dad43e1428bd3296f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1107&h=845&s=472108&e=png&b=1e1e1e)
**`receiver`这个参数对于vue中的响应式实现具有非常重要的意义。因为只要是读取属性，我们就需要走代理对象，而不是原始对象。**

#### [WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
WeakMap引用的对象，是弱引用，并不阻止js的垃圾回收机制。

- 弱引用：不会影响垃圾回收机制。即：WeakMap的key不再存在任何引用时，会被直接回收。

- 强引用：会影响垃圾回收机制。存在强引用的对象永远不会 被回收。

例如：在vue源码中使用在保存代理对象，如果当前对象以前被代理过，直接返回代理对象。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aea07a15011e443ca8dad477fe5eff53~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1189&h=626&s=130217&e=png&b=fcf5e1)
响应式依赖函数和对象以及对象属性映射的数据结构

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e672b3221b5b45c790e9b80ccf34b17b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1097&h=661&s=117458&e=png&b=fdf6e2)

## 响应式实现
### reactive
setter 执行依赖函数， getter 收集依赖函数。
#### reactive.ts

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05b9e25c05114a5387f78c8cd7f502cb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1165&h=583&s=94187&e=png&b=fefefe)
reactive函数，返回createReactiveObj(target, mutableHandlers, reactiveMap)。
 
createReactiveObj返回一个Proxy实例。放在WeakMap中判断创建。

#### effect.ts
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4476a7db646242c1b3c45251367b443c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1162&h=671&s=744740&e=png&b=212325)
内部调用ReactiveEffect类的run方法首次触发，依赖收集。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d7016eb378646bcac4be02e9856a3cb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=862&h=803&s=82070&e=png&b=fefdfd)
ReactiveEffect类接收fn作为参数。run方法中将`activeEffect`全局变量赋值为this。并执行fn。如果有获取属性操作，就会触发Proxy的getter方法。

并触发track, 定义WeakMap数据结构保存依赖函数。（每个对象每个属性都保存依赖收集函数）, trigger, 触发收集的依赖函数。**建立了targetMap和activeEffect之间的联系。**


#### baseHandlers.ts
定义Proxy操作方法，get（track）, set（trigger）等。

#### dep.ts
createDep 创建一个set对象。用于存储依赖函数。
    

#### 依赖收集和依赖触发数据结构

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f046abae23c6474a9b35b8d0c201c950~tplv-k3u1fbpfcp-watermark.image?)
```js
    class Dep {
      constructor() {
        this.subscribers = new Set();
      }

      depend() {
        if (activeEffect) {
          this.subscribers.add(activeEffect);
        }
      }

      notify() {
        this.subscribers.forEach(effect => {
          effect();
        })
      }
    }

    let activeEffect = null;
    function watchEffect(effect) {
      activeEffect = effect;
      effect();
      activeEffect = null;
    }


    // Map({key: value}): key是一个字符串
    // WeakMap({key(对象): value}): key是一个对象, 弱引用
    const targetMap = new WeakMap();
    function getDep(target, key) {
      // 1.根据对象(target)取出对应的Map对象
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
      }

      // 2.取出具体的dep对象
      let dep = depsMap.get(key);
      if (!dep) {
        dep = new Dep();
        depsMap.set(key, dep);
      }
      return dep;
    }


    // vue2对raw进行数据劫持
    function reactive(raw) {
      Object.keys(raw).forEach(key => {
        const dep = getDep(raw, key);
        let value = raw[key];

        Object.defineProperty(raw, key, {
          get() {
            // 将依赖函数传入到set中
            dep.depend();
            return value;
          },
          set(newValue) {
            if (value !== newValue) {
              value = newValue;
              // 调用该依赖相关的所有函数
              dep.notify();
            }
          }
        })
      })

      return raw;
    }

    // vue3对raw进行数据劫持
    function reactive(raw) {
      return new Proxy(raw, {
        get(target, key) {
          const dep = getDep(target, key);
          dep.depend();
          return target[key];
        },
        set(target, key, newValue) {
          const dep = getDep(target, key);
          target[key] = newValue;
          dep.notify();
        }
      })
    }

```

#### 断点跟踪vue源码

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
当我们修改代理对象中的属性，我们间接的在代理对象的set拦截器中修改了被代理对象的属性值。所以代理和被代理对象是同步的。
#### reactive, effect实现思路
调用reactive（返回proxy代理对象） > 在effect中创建ReactiveEffect实例 > 调用run方法（触发effect传入的回调，有代理对象的getter操作） > 触发代理对象的get方法（track函数收集依赖） > 收集对象对应的属性对应的activeEffect函数 > 触发代理对象的set方法（有代理对象的setter操作） > 触发对象对应的属性对应的activeEffect函数。

[reactive实现请访问这里](https://github.com/zhang-glitch/vue3_core_mini/tree/reactive-effect)

#### reactive局限性
- 不能处理基本数据类型。因为Proxy代理的是一个对象。
- 不能进行解构，结构后将失去响应性。因为响应性是通过代理对象进行处理的。结构后就不存在代理对象了，因此就不具备响应式了。
