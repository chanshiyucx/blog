[pixiv: 66213177]: # 'https://i.loli.net/2019/04/12/5caf6a4a9a7bf.jpg'

最近在写 Gitlife 博客主题的时候需要用到大量 svg 图标，故参考 element-admin，

```json
"devDependencies": {
  "svg-sprite-loader": "^4.1.3",
  "svgo": "^1.2.1",
}
```

```javascript
// vue.config.js
module.exports = {
  chainWebpack: config => {
    // svg rule loader
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule.exclude.add(/node_modules/)
    svgRule
      .test(/\.svg$/)
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
  }
}
```

```yml
# svgo.yml
plugins:
  - removeAttrs:
      attrs:
        - 'fill'
        - 'fill-rule'
```

```javascript
import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon' // svg组件

// register globally
Vue.component('svg-icon', SvgIcon)

const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
```

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
