import { createElement, createTextNode } from "./vdom/index"
import { patch } from "./vdom/patch"

export function lifeCycleMixin(Vue){ 
    Vue.prototype._c = function() {
        return createElement(this, ...arguments)
    }

    Vue.prototype._v = function () {
        return createTextNode(this, ...arguments)
    }

    Vue.prototype._s = function(value) {
        return value
    }

    Vue.prototype._render = function () {
        const vm = this
        const render = vm.$options.render
        let vnode = render.call(vm)
        return vnode
    }

    Vue.prototype._update = function (vnode) {
        const vm = this;
        vm.$el = patch(vm.$el, vnode)
    }

}


export function mountComponent(vm, el) {
    vm.$el = el
    const updateComoponent = () => {
        vm._update(vm._render())
    }

    updateComoponent()
}
