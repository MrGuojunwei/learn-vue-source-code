// 高内聚 低耦合
class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk(data) {
    // 循环对象  不用for in (会遍历原型链)
    let keys = Object.keys(data)
    keys.forEach((key) => {
      defineReactive(data, key, data[key])
    })
  }
}
// 性能不好的原因，所有的属性都被重新定义了一遍，并且是深度代理
function defineReactive(data, key, value) {
  // 属性会全部被重写，增加了get和set
  observe(value) // 递归代理属性
  Object.defineProperty(data, key, {
    get() {
      return value
    },
    set(newValue) {
      // vm.xxx = {} 赋值对象的话，也可以实现响应式对象

      if (newValue === value) return
      observe(value)
      value = newValue
    },
  })
}

export function observe(data) {
  if (typeof data !== 'object' || data == null) return
  // 如果一个对象已经被观测了，就不要再次被观测了
  // __ob__ 表示是否又被观测过
  new Observer(data)
}
