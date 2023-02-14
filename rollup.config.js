import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

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
      // ts 这里面添加的就是tsconfig中的配置。
      typescript({
        sourceMap: true
      }),
      // 模块导入的路径补全
      nodeResolve(),
      // 将commonjs转为esm
      commonjs()
    ]
  }
]
