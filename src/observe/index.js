import arrayPrototype from "./array"
// 高内聚 低耦合
class Observer {
  constructor(data) {
        // 如果存在__ob__属性，表示该数据被观测过
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false
        })
      if(Array.isArray(data)) {
        data.__proto__ = arrayPrototype
        // 如果数组里面是对象的话，对象也应该是响应式的
        this.observeArray(data)
      } else {
          this.walk(data)
      }
    
  }
  walk(data) {

    // 如果是数组的话，也是用defineProperty的话，会浪费很多性能

    // 改写数组的方法，如果用户调用了可以改写数组的api，我们改写这个api
    // 变异方法：push pop unshift shift reverse sort splice， 所以修改数组的索引和length是无法更新视图的




    // 循环对象  不用for in (会遍历原型链)
    let keys = Object.keys(data)
    keys.forEach((key) => {
      defineReactive(data, key, data[key])
    })
  }

  observeArray(data) {
      data.forEach(item => observe(item))
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
  if (data.__ob__) {
    return
}
  // __ob__ 表示是否又被观测过
  new Observer(data)
}
