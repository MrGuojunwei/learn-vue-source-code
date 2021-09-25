import babel from 'rollup-plugin-babel'

// 常见的模块规范 import export (esModule)  module.exports require (commonjs) AMD defined()  systemjs模块规范
// 常用模块规范 es6 common umd(支持cmd和amd)

export default {
    input: './src/index.js', // 打包入口文件
    output: {
        file: 'dist/vue.js', // 打包出口文件
        format: 'umd',
        name: 'Vue',
        sourcemap: true
    },
    plugins: [
        babel({ // es6 -> es5
            exclude: './node_modules/**'
        })
    ]
}