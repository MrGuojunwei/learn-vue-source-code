

let oldArrayPrototype = Array.prototype
let arrayPrototype = Object.create(oldArrayPrototype)
// arrayPrototype.__proto__ = oldArrayPrototype

let methods = [
    'push',
    'pop',
    'unshift',
    'shift',
    'reverse',
    'sort',
    'splice'
]

methods.forEach(method => { // 对原来的方法进行劫持，调用push方法时先经历自己写的方法，然后在调用数组原来的方法
    arrayPrototype[method] = function (...args) {
        let inserted // 表示新增的数据
        let ob = this.__ob__
        switch(method) {
            case 'push':
            case 'unshift':
                inserted = args; // 数组
                break;
            case 'splice':
                inserted = args.slice(2);
            default: break;
        }
        // 如果有新增的数据，对新增的数据进行响应式处理
        if (inserted) {
            ob.observeArray(inserted)
        }
        return oldArrayPrototype[method].call(this, ...args)
    }
})

// vue2中的响应式原理就是给对象每个属性增加get和set 并且是递归处理 用户在写代码的时候，尽量不要把所有的属性都放在data里，并且层次不要太深，赋值一个新对象，也会变成响应式的
// 数组没有使用defineProperty，使用的是函数劫持创造了一个新的原型重写了原型的7个方法，用户在调用的时候调用的是这7个方法，我们新增了逻辑新增的数组元素也会被响应式处理
// 注意 数组的索引和lenght没有被监控

export default arrayPrototype