最近上班有点闲，摸鱼摸出了个在线简历生成器 [Tamayura](https://github.com/chanshiyucx/tamayura)，提供在线编辑保存功能。后来寻思不够方便，便研究下如何一键保存 PDF。<!-- more -->

## 生成方案

一键生成 PDF 看起来是广大群众的普遍需求，网上一通 Google 便有不少现成方案，前人栽树后人乘凉，既然有成熟的方案那便直接采用了。

生成 PDF 基本思路大多一致，先用 [html2canvas](https://github.com/niklasvh/html2canvas) 将 DOM 元素转换为 canvas，再利用 canvas 的 toDataURL 方法输出为图片，最后使用 [JsPDF](https://github.com/MrRio/jsPDF) 将图片添加生成 PDF 实现一键下载。

html2canvas 是一个著名开源库，可将一个元素渲染为 canvas，只需要简单的调用 `html2canvas(element[, options])` 即可。该方法会返回一个包含有 canvas 元素的 promise。

jsPDF 是一个基于 HTML5 的客户端解决方案，用于在客户端 JavaScript 中生成 PDF 的库，支持文本、图片等格式。借助 jsPDF，利用之前生成的 canvas 元素，可以直接在前端生成 PDF 文件。

## 代码实现

```javascript
// 导出页面为PDF格式
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
  install(Vue) {
    Vue.prototype.getPdf = function(title) {
      const opts = {
        scale: 4, // 缩放比例，提高生成图片清晰度
        useCORS: true, //允许加载跨域的图片
        allowTaint: false,
        tainttest: true, //检测每张图片都已经加载完成
        logging: true //日志开关，发布的时候记得改成false
      }

      html2Canvas(document.getElementById('pdfDom'), opts).then(function(
        canvas
      ) {
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
