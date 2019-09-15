# Vue 一键导出 PDF

## 生成方案

生成 PDF 基本思路大多一致，先用 [html2canvas](https://github.com/niklasvh/html2canvas) 将 DOM 元素转换为 canvas，再利用 canvas 的 toDataURL 方法输出为图片，最后使用 [jsPDF](https://github.com/MrRio/jsPDF) 添加图片生成 PDF 实现一键下载。

html2canvas 是一个著名开源库，可将一个元素渲染为 canvas，只需要简单的调用 `html2canvas(element[, options])` 即可。该方法会返回一个包含有 canvas 元素的 promise。

jsPDF 是一个基于 HTML5 的客户端解决方案，用于在客户端 JavaScript 中生成 PDF 的库，支持文本、图片等格式。借助 jsPDF，利用之前生成的 canvas 元素，可以直接在前端生成 PDF 文件。

## 代码实现

根据以上方案，实现一个 vue 插件，提供 PDF 一键导出功能：

```javascript
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
  install(Vue) {
    Vue.prototype.getPdf = function(title) {
      const element = document.getElementById('pdfDom')
      const opts = {
        scale: 4, // 缩放比例，提高生成图片清晰度
        useCORS: true, // 允许加载跨域的图片
        allowTaint: false, // 允许图片跨域，和 useCORS 二者不可共同使用
        tainttest: true, // 检测每张图片都已经加载完成
        logging: true // 日志开关，发布的时候记得改成 false
      }

      html2Canvas(element, opts).then(function(canvas) {
        let contentWidth = canvas.width
        let contentHeight = canvas.height
        let pageHeight = (contentWidth / 592.28) * 841.89
        let leftHeight = contentHeight
        let position = 0
        let imgWidth = 595.28
        let imgHeight = (592.28 / contentWidth) * contentHeight
        let pageData = canvas.toDataURL('image/jpeg', 1.0)
        let PDF = new JsPDF('', 'pt', 'a4')
        if (leftHeight < pageHeight) {
          PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
        } else {
          while (leftHeight > 0) {
            PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
            leftHeight -= pageHeight
            position -= 841.89
            if (leftHeight > 0) {
              PDF.addPage()
            }
          }
        }
        PDF.save(title + '.pdf')
      })
    }
  }
}
```

食用方式：

```javascript
import htmlToPdf from './utils/htmlToPdf'

Vue.use(htmlToPdf)
```

注意点：

1. 如果引入外链图片，需要配置图片跨域，并给 img 标签设置 `crossOrigin='anonymous'`。
2. 尽量提高生成图片质量，可以适当放大 canvas 画布，通过设置 scale 缩放画布大小，或者设置 dpi 提高清晰度。
