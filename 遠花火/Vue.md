## v-model

### v-model 用在 input 元素上

v-model 虽然很像使用了双向数据绑定的 Angular 的 ng-model，但是 Vue 是单项数据流，v-model 只是语法糖而已：

```html
<input v-model="sth" />
<input :value="sth" @input="sth = $event.target.value" />
```

input 元素本身有个 oninput 事件，类似 onchange，每当输入框内容发生变化，就会触发 oninput，把最新的 value 传递给 sth。

在给 input 元素添加 v-model 属性时，默认会把 value 作为元素的属性，然后把 'input' 事件作为实时传递 value 的触发事件。

### v-model 用在组件上

v-model 不仅仅能在 input 上用，在组件上也能使用：

```html
<div id="demo">
  <currency-input v-model="price"></currentcy-input>
  <span>{{price}}</span>
</div>

<script src="https://cdn.bootcss.com/vue/2.3.0/vue.js"></script>
<script>
Vue.component('currency-input', {
  template: `
    <span>
      <input
        ref="input"
        :value="value"
        <!--为什么这里把 'input' 作为触发事件的事件名？`input` 在哪定义的？-->
        @input="$emit('input', $event.target.value)"
      >
    </span>
  `,
  props: ['value'],// 为什么这里要用 value 属性，value在哪里定义的？貌似没找到啊？
})

var demo = new Vue({
  el: '#demo',
  data: {
    price: 100,
  }
})
</script>
```

为解决上面两个问题，分析下面代码等价：

```html
<currency-input v-model="price"></currentcy-input>
<currency-input :value="price" @input="price = arguments[0]"></currency-input>
```

给组件添加 v-model 属性时，默认会把 value 作为组件的属性，然后把 'input' 值作为给组件绑定事件时的事件名。

### v-model 痛点

当创建类似复选框或者单选框的常见组件，v-model 力不从心：

```html
<input type="checkbox" v-model="sth" />
```

v-model 提供好了 value 属性和 oninput 事件，但是需要的是 checked 属性，并且当点击这个单选框的时候不会触发 oninput 事件，它只会触发 onchange 事件。

当 v-model 用到了 input 元素：

```html
<input type="checkbox" :checked="status" @change="status = $event.target.checked" />
```

当 v-model 用到组件上：

```html
<my-checkbox v-model="foo"></my-checkbox>

<script src="https://cdn.bootcss.com/vue/2.3.0/vue.js"></script>
<script>
Vue.component('my-checkbox', {
  tempalte: `<input
               type="checkbox"
               @change="$emit('input', $event.target.checked)"
               :checked="value"
             />`
  props: ['value'],
})
</script>
```

在 Vue 2.2 版本，可以在定义组件时通过 model 选项的方式来定制 prop/event：

```html
<my-checkbox v-model="foo"></my-checkbox>

<script src="https://cdn.bootcss.com/vue/2.3.0/vue.js"></script>
<script>
Vue.component('my-checkbox', {
  tempalte: `<input
               type="checkbox"
               <!--这里就不用 input 了，而是 balabala-->
               @change="$emit('balabala', $event.target.checked)"
               :checked="checked"
             />`
  props: ['checked'], //这里就不用 value 了，而是 checked
  model: {
    prop: 'checked',
    event: 'balabala'
  },
})
</script>
```

参考原文：

[Vue 进阶教程之：详解 v-model](https://www.jianshu.com/p/4147d3ed2e60)
