import { initState } from './state'

export default function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    //   vue会判断，如果是$开头的属性，不会被变成响应式数据
    this.$options = options // 所有后续扩展的方法，都有一个$options属性获取用户的所有选项
    initState(this)
 
  }
}
