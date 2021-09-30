const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // 用来描述标签的
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 标签开头的正则，匹配的是标签名

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) //匹配标签结尾的</div> 捕获的是结束标签的标签名

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ //匹配属性的 分组1拿到的是属性名，分组3，4，5拿到的是key对应的值

const startTagClose = /^\s*(\/?)>/ //匹配标签结束的> 或 />

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配双花括号中间的内容
/**
 *
 * @param {String} html 解析的html字符串
 * @returns
 * 解析前 <div id="app" ><p>文本</p></div>
 * 解析后
 * {
 *    tag: 'div',
 *    attrs: [{name: 'id', value: 'app'}],
 *    type: 1,
 *    parent: null,
 *    children: [
 *      {
 *         tag: 'p',
 *         attrs: [],
 *         type: 1,
 *         children: [{type: 3, text: '我是文本'}],
 *         parent: {循环引用}
 *      }
 *    ]
 * }
 *
 */
function parseHtml(html) {
  // 记录根节点
  let root
  // 构建树的父子关系
  let stack = []
  function advance(n) {
    html = html.substring(n) // 每次根据传入的长度截取html
  }
  function parseStartTag() {
    const matches = html.match(startTagOpen)
    if (matches) {
      const match = {
        tagName: matches[1],
        attrs: [],
      }
      advance(matches[0].length)
      let end, attr
      // 只要没有匹配到结束标签 并且匹配到属性标签，就一直匹配
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        })
        advance(attr[0].length) // 解析一个属性删除一个
      }
      if (end) {
        advance(end[0].length)
        return match
      }
    }
  }
  // 解析结束标签
  function parseEndTag() {
    const matches = html.match(endTag)
    if (matches) {
      end(matches[1])
      advance(matches[0].length)
      return matches
    }
  }
  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      attrs,
      children: [],
      parent: null,
      type: 1,
    }
  }
  function start(tagName, attrs) {
    let element = createASTElement(tagName, attrs)
    if (root == null) {
      root = element
    }
    let parent = stack[stack.length - 1] // 取得栈中的最后一个
    if (parent) {
      // 父子节点创建关联关系
      element.parent = parent
      parent.children.push(element)
    }
    stack.push(element) // 将元素推入栈中
  }

  function end(tagName) {
    stack.pop()
  }

  // 文本解析
  function chars(text) {
    text = text.replace(/\s/g, '')
    if (text) {
      let parent = stack[stack.length - 1]
      parent.children.push({
        type: 3,
        text,
      })
    }
  }

  while (html) {
    let textEnd = html.indexOf('<')
    if (textEnd === 0) {
      let startTagMatch // 解析开始标签 {tag: 'div', attrs: [{name: 'id', value: 'app'}]}
      // 如果是开始标签，进行标签名和属性的收集  并关联父子节点关系
      if ((startTagMatch = parseStartTag())) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      // 如果是结束标签，解析结束标签
      if (parseEndTag()) {
        continue
      }
    }
    let text
    if (textEnd > 0) {
      text = html.substring(0, textEnd)
    }
    if (text) {
      advance(text.length)
      chars(text)
    }
  }

  return root
}

function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    // 处理特殊的属性style
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').reduce((mome, current) => {
        let [key, value] = current.split(':')
        mome[key] = value
        return mome
      }, obj)
    }

    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}

// 处理节点  文本节点或dom节点
function gen(node) {
  if (node.type === 1) {
    return genCode(node)
  } else {
    let text = node.text
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    } else {
      // ab {{ text }} {{bb}} cd的情况
      let tokens = []
      let match
      let startIndex = (defaultTagRE.lastIndex = 0) // lastIndex表示下一次搜索的开始位置，该值每次用时都要置为0
      while ((match = defaultTagRE.exec(text))) {
        let endIndex = match.index
        if (endIndex > startIndex) {
          // 将 {{前面的字符存储起来
          tokens.push(JSON.stringify(text.slice(startIndex, endIndex)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        startIndex = endIndex + match[0].length
      }
      // 剩下还有
      if (startIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(startIndex)))
      }

      return `_v(${tokens.join('+')})` // 将动态数据和非动态数据进行绑定到一块
    }
  }
}
// 处理子节点
function genChildren(ast) {
  const children = ast.children
  return children.map((child) => gen(child)).join(',')
}

// 生成函数体字符串
function genCode(ast) {
  // 字符串拼接
  let code
  code = `_c("${ast.tag}", ${
    ast.attrs.length ? genProps(ast.attrs) : undefined
  }${ast.children ? ', ' + genChildren(ast) : ''})`
  return code
}

export function compileToFunction(template) {
  // 将template转换成语法树，再将语法树转换成字符串拼接在一起

  // ast  是用来描述语言本身的
  let ast = parseHtml(template)
  // 通过ast语法转化成render函数
  let code = genCode(ast)

  const render = new Function(`with(this){return ${code}}`) // 将字符串变成函数
  return render
}
