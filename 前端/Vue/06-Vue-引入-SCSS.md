# Vue 引入 SCSS

使用 `vue init webpack` 生成的 vue 模板项目中引入 scss 步骤：

1. `vue init my-project`
2. `npm install node-sass@4 sass-loader@7 sass-resources-loader -D`（兼容问题，需要使用旧版本的包）
   > Similar to what @KostDM said, in my case it seems like sass-loader@11.0.0 doesn't work with vue@2.6.12.
3. 修改 `build/utils.js` 文件如下

```javascript
// scss: generateLoaders('sass')

scss: generateLoaders('sass').concat({
  loader: 'sass-resources-loader',
  options: {
    resources: path.resolve(__dirname, '../src/assets/styles/index.scss'),
  },
})
```

之后在 `main.js` 中可以不需要再引入全局 scss 文件：

```javascript
// import '@/assets/styles/index.scss'
```

就此，大功告成！

需要注意一点，新版本的 `node-sass` 和 `sass-loader` 与 vue 不兼容，所以需要使用旧版本的包。

参考文档：

- [vuejs-templates 官方文档](http://vuejs-templates.github.io/webpack/)
- [vue 配置 sass、scss 全局变量](https://segmentfault.com/a/1190000018219877)
- [TypeError: this.getOptions is not a function](https://stackoverflow.com/questions/66082397/typeerror-this-getoptions-is-not-a-function)
- [webpack-simple:Invalid CSS after](https://github.com/vuejs-templates/webpack-simple/issues/107)
