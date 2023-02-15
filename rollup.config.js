import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
// Rollup 是一个 JavaScript 模块打包工具，可以将多个小的代码片段编译为完整的库和应用。
// 他是基于es6 module 的打包工具。将其打包成cmj, umd等格式
export default [
  {
    input: 'packages/vue/src/index.ts',
    output: [
      {
        sourcemap: true, // 这个选项需要和tsconfig中的sourceMap中保持一致。
        file: './packages/vue/dist/vue.global.js',
        format: 'iife',
        name: 'Vue'
      }
    ],
    plugins: [
      // 将commonjs转为esm， 这个应该放在所有插件之前使用
      commonjs(),
      // ts 这里面添加的就是tsconfig中的配置。
      typescript({
        sourceMap: true
      }),
      // 模块导入的路径补全
      nodeResolve()
    ]
  }
]
