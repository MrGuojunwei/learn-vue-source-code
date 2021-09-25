import { observe } from './observe/index'

export function initState(vm) {
  const options = vm.$options
  if (options.data) {
    initData(vm)
  }
}

function initData(vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data

  // 属性劫持 采用defineProperty对data中所有的属性劫持
  observe(data)
}
