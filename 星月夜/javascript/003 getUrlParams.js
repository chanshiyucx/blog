const getUrlParams = attr => {
  // 分组运算符是为了把结果存到 exec 函数返回的结果里
  const match = RegExp(`[?&]${attr}=([^&]*)`).exec(window.location.search)
  // ["?name=chanshiyu", "chanshiyu", index: 0, input: "?name=chanshiyu&age=24"]
  // url 中+号表示空格，要替换掉
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '))
}

// url = 'https://www.baidu.com?name=chanshiyu&age=24'
console.log(getUrlParams('name'))
