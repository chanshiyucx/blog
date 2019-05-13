## redirect 刷新页面

目的是在不刷新页面的情况下更新路由组件内容，实现类似 `location.reload()` 的功能，区别是只更新路由组件而不是刷新整个页面。关于这个问题的讨论可以查看 Github Issues [[Feature] A reload method like location.reload()](https://github.com/vuejs/vue-router/issues/296)。

实现方法是注册一个 `redirect` 的路由，然后手动重定向页面到 `/redirect` 页面，然后将页面重新 redirect 重定向回来，由于页面的 key 发生了变化，从而间接实现了刷新页面组件的效果。

参考 `vue-element-admin` 的实现方案：

```javascript
// 1. 手动注册 redirect 路由
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


// 2. 其他页面手动重定向页面到 '/redirect' 页面
const { fullPath } = this.$route
this.$router.replace({
  path: '/redirect' + fullPath
})
```

## removeRoutes

Vue Router 可以通过 `addRoutes` 来添加动态路由，却没有方法来移除路由。这就是导致一个问题，当用户权限发生变化的时候，或者说用户登出的时候，只能通过刷新页面的方式，才能清空之前注册的路由。作为一个 spa，刷新页面其实是一种很糟糕的用户体验。

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
