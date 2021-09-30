// 自己编写的vue入口文件
import initMixin  from "./init"
import {lifeCycleMixin} from './lifecycle'

function Vue(options) {
    this._init(options)
}

initMixin(Vue)
lifeCycleMixin(Vue)

// 给 vue添加原型方法 ，通过添加文件的方式添加，防止所有的功能再一个文件中来处理
export default Vue