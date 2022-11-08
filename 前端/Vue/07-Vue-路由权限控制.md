# Vue 路由权限控制

## v-permission

`v-permission` 封装了一个指令权限，能简单快速的实现按钮级别的权限判断。

参考代码：[vue-element-admin](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/directive/permission/permission.js)

```js
// directive/permission/permission.js
import router from '@/router'

export default {
  inserted(el, binding, vnode) {
    const { value } = binding
    if (value && value instanceof Array && value.length > 0) {
      const currentRoute = router.currentRoute
      const hasPermission = value.includes(currentRoute.meta.permission)
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      theow new Error(`need operate permissions! Like v-permission="[1,2]"`)
    }
  }
}

// directive/permission/index.js
import permission from './permission'

const install = function(Vue) {
  Vue.directive('permission', permission)
}

if (window.Vue) {
  window['permission'] = permission
  Vue.use(install)
}

permission.install = install
export default permission
```

注册到全局：

```js
// main.js
import permission from '@/directive/permission/index.js'

Vue.use(permission)
```

使用示例：

```vue
<template>
  <el-tag v-permission="[1, 2]">admin</el-tag>
</template>
```

v-permission 的局限：

> In some cases it is not suitable to use v-permission, such as element Tab component which can only be achieved by manually setting the v-if.

此时可以使用全局权限判断函数 `checkPermission`，用法和指令 `v-permission` 类似。

## checkPermission

```js
// utils/permission.js
import router from '@/router'

export default function checkPermission(value) {
  if (value && value instanceof Array && value.length > 0) {
    const currentRoute = router.currentRoute
    return value.includes(currentRoute.meta.permission)
  } else {
    console.error(`need operate permissions! Like v-permission="[1,2]"`)
    return false
  }
}
```

使用示例：

```vue
<template>
  <el-tag v-if="checkPermission([1, 2])">admin</el-tag>
</template>
```
