# Vue Tips

## 001 redirect 刷新页面

目的是在不刷新页面的情况下更新路由，实现类似 `location.reload()` 的功能，区别是只更新路由而不是刷新整个页面。关于这个问题的讨论可以查看 Github Issues [\[Feature\] A reload method like location.reload\(\)](https://github.com/vuejs/vue-router/issues/296)。

实现方法是注册一个 `redirect` 的路由，手动重定向页面到 `/redirect` 页面，然后再将页面重定向回来，由于页面的 key 发生了变化，从而间接实现了刷新页面组件的效果。

参考 `vue-element-admin` 的实现方案：

```javascript
// 1. 手动注册 redirect 路由【redirect.vue】
<script>
export default {
  beforeCreate() {
    const { params, query } = this.$route
    const { path } = params
    this.$router.replace({ path: '/' + path, query })
  },
  render: function(h) {
    return h() // avoid warning message
  }
}
</script>


// 2. 其他页面手动重定向到 '/redirect' 页面
const { fullPath } = this.$route
this.$router.replace({
  path: '/redirect' + fullPath
})
```

## 002 removeRoutes

Vue Router 可以通过 `addRoutes` 来添加动态路由，却没有方法来移除路由。这就是导致一个问题，当用户权限发生变化的时候，或者说用户登出的时候，只能通过刷新页面的方式，才能清空之前注册的路由。作为一个 SPA 应用，刷新页面其实是一种很糟糕的用户体验。

Vue Router 注册的路由信息都是存放在 `matcher` 之中的，所以如果想清空路由，只需要将 `matcher` 清空即可。那如何实现呢？首先新建一个空的 `Router` 实例，将之前路由的 `matcher` 替换为空实例的 `matcher` 即可。

参考 `vue-element-admin` 的实现方案：

```javascript
const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
```

## 003 引入 CDN 文件

对于项目中用到的一些第三方库，可以通过 CDN 的方式来引入，这样可以增加项目构建的速度，而且如 jsdelivr、unpkg 等 CDN 源提供免费的资源加速与缓存优化。一般的 CDN 资源引入方式是在 `index.html` 里直接引入外链，但是这种方式不够优雅，通过 webpack 可以用更 Geek 的方式实现。

参考 `vue-element-admin` 的实现方案：

```javascript
// vue.config.js
module.exports = {
  productionSourceMap: false,
  chainWebpack(config) {
    const cdn = {
      css: ['//fonts.googleapis.com/css?family=Noto+Serif+SC'],
      js: ['//cdn.jsdelivr.net/npm/animejs@3.0.1/lib/anime.min.js']
    }
    config.plugin('html').tap(args => {
      args[0].cdn = cdn
      return args
    })
  }
}
```

然后在 `public/index.html` 中依次注入 css 与 js：

```markup
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- 引入样式 -->
    <% for(var css of htmlWebpackPlugin.options.cdn.css) { %>
    <link rel="stylesheet" href="<%=css%>" />
    <% } %>
  </head>
  <body>
    <div id="app"></div>
    <!-- 引入JS -->
    <% for(var js of htmlWebpackPlugin.options.cdn.js) { %>
    <script src="<%=js%>"></script>
    <% } %>
  </body>
</html>
```

## 004 Watch immediate

Vue watch 数据时在实例初始化时并不会执行，只有初始化后更新才会触发。如何让 watch 在初始化时候也执行呢？

其实 watch 的变量可以申明为一个对象，对象提供三个属性 `immediate`、`deep`、`handler`。`immediate` 表示初始化时是否立即执行。`deep` 表示是否进行深度监听，如果 watch 一个对象，设置深度监听的话如果对象的某个属性更新的话也会触发。`handler` 表示更新的回调函数。

```javascript
watch: {
  query: {
    immediate: true,
    deep: true,
    handler(val) {
      console.log('new val', val)
    }
  }
}
```

## 005 Attrs 和 Listeners

如果有 react 使用经验的同学会知道，在 react 中可以通过扩展运算符来一次性传递多个 props，但是在 Vue 中如何实现呢？

```javascript
// React 中一次性传入多个 props
<Hello {...props} />
```

在 vue 2.4 版本中新增了两个新特性，`v-bind="$attrs"` 传递所有属性，`v-on="$listeners"` 传递所有方法，这两个属性在进行第三方组件封装和写高阶组件时大有妙用。

在高阶组件中，本质是实现一个中间件，将父组件传过来的 props 传递给子组件，如果传递 props 有很多，这两个新属性就派上了用场，这让我们不必要在 `$props` 中申明方法和属性而可以直接引用。

```javascript
<Hello v-bind="$attrs" v-on="$listeners" />
```

## 006 Google 桌面通知

首先定义插件：

```javascript
// notification.js
let notification = {}
notification.install = function(Vue, options) {
  Vue.prototype.$notification = (title, options) => {
    // 先检查浏览器是否支持
    if (!('Notification' in window)) {
      alert('很抱歉当前浏览器不支持桌面通知！')
    } else if (Notification.permission === 'granted') {
      // 检查用户是否同意接受通知
      notification = new Notification(title, options)
      notification.onclick = function() {
        window.focus()
      }
    } else if (Notification.permission !== 'denied') {
      // 否则我们需要向用户获取权限
      Notification.requestPermission(function(permission) {
        // 如果用户同意，就可以向他们发送通知
        if (permission === 'granted') {
          notification = new Notification(title, options)
          notification.onclick = function() {
            window.focus()
          }
        }
      })
    }
  }
}
export default notification
```

然后注册插件：

```javascript
// main.js
import Notification from '@/utils/notification'
Vue.use(Notification)
```

食用方式：

```javascript
this.$notification('提示', {
  body: '提示内容',
  icon: 'static/icon.png'
})
```
