import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { mountComponent } from './lifecycle'

export default function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    //   vue会判断，如果是$开头的属性，不会被变成响应式数据
    this.$options = options // 所有后续扩展的方法，都有一个$options属性获取用户的所有选项
    initState(this)


    // 状态初始化完毕后进行页面挂载
    if(this.$options.el) {
        this.$mount(this.$options.el)
    }
 
  }

  Vue.prototype.$mount = function (el) {
      const vm = this
      el = document.querySelector(el)
      const options = vm.$options
      if (!options.render) {
          let template = options.template
          if (!template) {
              template = el.outerHTML  
          }
        //   将template编译成render函数
        const render = compileToFunction(template)
        console.log(render)
        options.render = render
      }

      mountComponent(vm, el) // 执行挂载
    //   根据模板渲染出一个render函数，render函数返回一个虚拟节点
    // diff 算法 对更新前后的虚拟节点进行对比，找出差异
  }
}
