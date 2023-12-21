/**
 * @description 字符串转 HTML
 * @param {string} htmlString 待转换字符串
 * @return {HTMLElement} 转换后的 HTML 元素
 */
const convertStringToHTML = (htmlString: string): HTMLElement => {
  const parser = new DOMParser()
  const html = parser.parseFromString(htmlString, "text/html")
  return html.body
}

// 测试用例
const htmlString = `
    <a href="demo/img/journey.jpg">
      <img src="demo/img/journey_thumbnail.jpg" />
    </a>
`
console.log(convertStringToHTML(htmlString))
