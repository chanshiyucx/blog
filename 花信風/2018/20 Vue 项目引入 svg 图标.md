[pixiv: 66213177]: # 'https://i.loli.net/2019/04/12/5caf6a4a9a7bf.jpg'

最近在写 Gitlife 博客主题的时候需要用到大量 svg 图标，故参考 element-admin，

## 安装依赖

首先安装依赖包 [svgo](https://github.com/svg/svgo) 和 [svg-sprite-loader](https://github.com/kisenka/svg-sprite-loader)，这两个工具包都是给 webpack 打包 svg 图标资源使用。

- svgo: Node.js tool for optimizing SVG files.
- svg-sprite-loader: Webpack loader for creating SVG sprites.

```json
"devDependencies": {
  "svgo": "^1.2.1",
  "svg-sprite-loader": "^4.1.3"
}
```

然后配置 webpack 对于 svg 文件的 loader，修改 `vue.config.js` 文件，引入刚刚安装的 svg loader，详情如下：

```javascript
// vue.config.js
module.exports = {
  chainWebpack: config => {
    // svg rule loader
    const svgRule = config.module.rule('svg') // 找到 svg-loader
    svgRule.uses.clear() // 清除已有 loader
    svgRule.exclude.add(/node_modules/) ) // 排除 node_modules 目录
    svgRule // 添加新的 svg loader
      .test(/\.svg$/)
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
  }
}
```

## 引入资源

这里举个栗子，新建 `src/assets/icons` 文件夹，在此文件夹下新建 `svg` 子文件夹用于存放 svg 图标文件，并新增 svgo 配置文件 `svgo.yml`，详见官方文档，添加简要配置如下：

```yml
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
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
```

SvgIcon 组件如下：

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
        required: true
      },
      className: {
        type: String,
        default: ''
      }
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
      }
    }
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
