# Github Style 博客主题

前不久闲逛发现了个 Github Style 的 Hexo 博客主题 [小白妹妹写代码](https://sabrinaluo.github.io/tech/)，突然感觉这种简约风格主题莫名好看，故摸鱼摸了一周也仿了个 Github Style 的单页面主题 Gitleaf。

## About Gitleaf

![Gitleaf](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Github-Style-博客主题/Github_Style_博客主题.png)

[Gitleaf](https://github.com/chanshiyucx/gitleaf) 是一个 Github Style 的单页面博客应用程序，同博主当前所使用的 [Aurora](https://github.com/chanshiyucx/aurora) 主题类似，基于 Vue 开发。主题后台数据源依托于 [Github Issues](https://developer.github.com/v3/issues/)，配合使用 [Github REST API v3](https://developer.github.com/v3/) 与 [GraphQL API v4](https://developer.github.com/v4/) 提供的接口支持，无需数据库与服务器。

博客评论系统使用开源项目 [Gitalk](https://github.com/gitalk/gitalk)，[Valine](https://valine.js.org/) 作为备用评论系统。该主题基于 Github 全家桶，脱离服务器与数据库，关注内容本身，操作简单，免费食用。

技术栈：Github Api + Github Pages + Github Style + Gitalk

食用文档可参考 [Aurora 食用指南](https://chanshiyu.com/#/post/41)，在线演示：[蝉時雨](https://chanshiyu.com/treasure/gitleaf)

## Getting Started

### Installing

```bash
git@github.com:chanshiyucx/gitleaf.git
cd gitleaf
npm install # or yarn
```

### Configuration

修改目录 `src/config.js` 的配置文件，每个配置项都有详细说明。**注意修改 vue.config.js 的 publicPath**。

页面模板参考： [文章、关于、标签、分类、书单等模板](https://github.com/chanshiyucx/Blog/issues)，第一次食用可以直接 Fork 预览效果。

### Preview

```bash
npm start
```

浏览器打开 `http://localhost:8000` 便可访问新的博客！

### Deployment

```bash
npm run build
```

打包完毕，将 `dist` 目录下生成的静态文件发布 `Github Pages` 或 `Coding Pages` 即可。

Just enjoy it ฅ●ω●ฅ

主题参考：
[小白妹妹写代码](https://sabrinaluo.github.io/tech/)
