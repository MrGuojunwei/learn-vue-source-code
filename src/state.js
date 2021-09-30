import { observe } from './observe/index'

export function initState(vm) {
  const options = vm.$options
  if (options.data) {
    initData(vm)
  }
}

function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[source][key]
        },
        set(newValue) {
            vm[source][key] = newValue
        }
    })
}

function initData(vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data

//   通过vm.xxx 取值vm._data.xxx
for (let key in vm._data) {
    proxy(vm, '_data', key)
}

  // 属性劫持 采用defineProperty对data中所有的属性劫持
  observe(data)
}
