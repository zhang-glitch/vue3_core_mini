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