# Vue 项目引入 SVG 图标

## 关于 SVG

SVG 是一种可缩放矢量图形（Scalable Vector Graphics，SVG）是基于可扩展标记语言（XML），用于描述二维矢量图形的图形格式。SVG 由 W3C 制定，是一个开放标准。

SVG 在既能满足现有图片的功能的前提下，又是矢量图，在可访问性上面也非常不错，并且有利于 SEO 和无障碍，在性能和维护性方面也比 icon font 要出色许多。

SVG 与 icon font 的区别：

1. icon font 是字体渲染，而 svg 是图形渲染，icon font 在一倍屏幕下渲染效果不好，细节部分锯齿明显
2. icon font 因为是字体只能支持单色
3. icon font 可读性不够好，icon font 主要在页面用 Unicode 符号调用对应的图标，对浏览器和搜索引擎不友好

## 安装依赖

在 vue 项目中引入 svg，首要工作是安装依赖包 [svgo](https://github.com/svg/svgo) 和 [svg-sprite-loader](https://github.com/kisenka/svg-sprite-loader)，这两个工具包都是给 webpack 打包 svg 图标资源使用。

- svgo: Node.js tool for optimizing SVG files.
- svg-sprite-loader: Webpack loader for creating SVG sprites.

```javascript
"devDependencies": {
  "svgo": "^1.2.1",
  "svg-sprite-loader": "^4.1.3"
}
```

然后配置 webpack 对于 svg 文件的 loader，修改 `vue.config.js` 文件，引入刚刚安装的 svg loader，详情如下：

```javascript
// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    // svg rule loader
    const svgRule = config.module.rule('svg') // 找到 svg-loader
    svgRule.uses.clear() // 清除已有 loader
    svgRule.exclude.add(/node_modules/) // 排除 node_modules 目录
    svgRule // 添加新的 svg loader
      .test(/\.svg$/)
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
  },
}
```

## 引入资源

这里举个栗子，新建 `src/assets/icons` 文件夹，在此文件夹下新建 `svg` 子文件夹用于存放 svg 图标文件，并新增 svgo 配置文件 `svgo.yml`，详见官方文档，添加简要配置如下：

```text
# svgo.yml
plugins:
  - removeAttrs:
      attrs:
        - 'fill'
        - 'fill-rule'
```

在此文件夹下新增 index.js 引入 svg 资源并全局注册 vue 组件，代码如下：

```javascript
import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon' // svg组件

// register globally
Vue.component('svg-icon', SvgIcon)

const req = require.context('./svg', false, /\.svg$/)
const requireAll = (requireContext) => requireContext.keys().map(requireContext)
requireAll(req)
```

`require.context()` 方法来创建自己的（模块）上下文，这个方法有 3 个参数：

- 要搜索的文件夹目录
- 是否还应该搜索它的子目录
- 以及一个匹配文件的正则表达式

创建一个通用的引入图标的 SvgIcon 组件如下：

```html
<template>
  <svg :class="svgClass" aria-hidden="true" v-on="$listeners">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
  export default {
    name: 'SvgIcon',
    props: {
      iconClass: {
        type: String,
        required: true,
      },
      className: {
        type: String,
        default: '',
      },
    },
    computed: {
      iconName() {
        return `#icon-${this.iconClass}`
      },
      svgClass() {
        if (this.className) {
          return 'svg-icon ' + this.className
        } else {
          return 'svg-icon'
        }
      },
    },
  }
</script>

<style scoped>
  .svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
</style>
```

最后不要忘记在 `main.js` 里引入 icons:

```javascript
import './assets/icons'
```

食用方式，添加 svg 文件到 `/assets/icons/svg` 文件夹下即可，如添加 `github.svg` 后在 vue 文件里引入：

```html
<svg-icon icon-class="github" />
```

参考文章：  
[在 vue 项目中优雅的使用 Svg](https://juejin.im/post/5bcfdad4e51d457a8254e9d6)
