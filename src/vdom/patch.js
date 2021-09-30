export function patch(oldVnode, vnode) {
    const isRealElement = oldVnode.nodeType 

    if (isRealElement) {
        const oldElm = oldVnode

        // 需要获取父节点，将当前节点的下一个元素作为参照物，将它插入，之后删除老节点
        const parentNode= oldElm.parentNode
        let el = createElm(vnode) // 根据新的vnode创建新节点
        parentNode.insertBefore(el, oldElm.nextSibling)
        parentNode.removeChild(oldElm)

        return el
    }
}

function createElm(vnode) {
    let {tag, data, children, text} = vnode
    if (typeof tag === 'string') {
        vnode.el = document.createElement(tag) // 将真实节点绑定到虚拟节点上
        // 添加属性
        if (typeof data === 'object' && data !== null) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    vnode.el.setAttribute(key, data[key])
                }
            }
        }
        children.forEach(child => {
            vnode.el.appendChild(createElm(child)) // 递归挂载
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el // 返回创建出来的真实节点
}