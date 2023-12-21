/**
 * @description 获取图片源文件
 * @param {HTMLElement} el 图片 DOM 元素
 * @return {string|null} 图片源文件
 */
const getOriginalSource = (el: HTMLElement): string | null => {
  if (el.dataset.original) {
    return el.dataset.original
  } else if (el.parentElement?.tagName === "A") {
    return el.parentElement.getAttribute("href")
  } else {
    return null
  }
}

/**
 * 测试用例
 * 1. data attribute
 * <img src="img/journey_thumbnail.jpg" data-original="img/journey.jpg" />
 *
 * 2. anchor link
 * <a href="demo/img/journey.jpg">
 *  <img src="demo/img/journey_thumbnail.jpg" />
 * </a>
 */
