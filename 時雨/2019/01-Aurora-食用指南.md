# Aurora 食用指南

Aurora 是一款动漫风格博客主题，基于 Vue 开发，使用开源的 Github Api 服务，开发至今一直以为主题无人问津，近来有人问起如何食用，故忙里偷闲摸一篇简单食用文档。

相较于 Wordpress 和 Typecho 等博客框架，Aurora 主题最大的优势就是简单轻量与免费，全部使用现有开源免费服务，相对稳定，也不怕 Github 跑路（笑），文章发布与更新也是相当简单，不需要操作服务器与数据库，对新人来说非常友好。

## 初始化环境

在食用 Aurora 主题之前，需先安装 Nodejs 和 Git 环境，这两步不必细说。环境安装完毕，由于 Aurora 使用 vue 开发，所以需要安装 `vue-cli`。

```bash
npm install -g @vue/cli-service-global
```

然后将主题 clone 到本地并安装依赖包：

```bash
# clone 主题
git clone git@github.com:chanshiyucx/aurora.git

# 进入主题目录
cd aurora

# 安装依赖包
npm install

# 本地预览
npm start
```

依赖包安装完毕，便可执行 `npm start` 本地预览效果，访问 `http://localhost:8080/`, 当然现在看到的是我的博客，接下来需要我们自定义主题。

## 替换站点标题和图标

首先修改浏览器上标签页的站点标题和图标，在主题目录 `public/` 下有三个图标 `apple-icon-180x180.png、favicon-16x16.png、favicon-32x32.png`，用你自己的站点图标替换它们。然后修改 `public/index.html` 的站点标题为你的网站标题。

```markup
<!-- 替换成你自己的网站标题 -->
<title>蝉時雨</title>
```

## 配置主题

主题配置文件为根目录下 `src/config.js`，里面每个配置项皆有详细注释，这里对一些基本配置项做简要说明。

### 配置文章仓库

Aurora 使用 Github api 做后台数据托管。所以需要新建一个仓库来存放文章和一些自定义页面内容。这里新建一个仓库取名为 Blog 为例。

由于 Github api 有访问次数限制，所以需要申请 token 来解除访问限制，[申请地址戳这里](https://github.com/settings/tokens/new)。将申请的 token 从中间随意拆成两部分填入配置项，拆分的目的避免代码提交的时候 github 对其进行检测，导致 token 失效。

![Github Token](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/github_token.png)

```javascript
// github 用户名
username: 'chanshiyucx',
// 仓库地址
repository: 'blog',
// token 从中间任意位置拆开成两部分，避免 github 代码检测失效
token: ['0ad1a0539c5b96fd18fa', 'aaafba9c7d1362a5746c'],
```

### 配置 Leancloud

Aurora 主题的文章阅读次数与 Valine 评论系统都是采用 [Leancloud](https://leancloud.cn/) 存储。注册一个 Leancloud 账号并新建一个应用，将应用 key 填入相应配置项。 **然后创建三个 Class，Comment 用来存储游客评论、Counter 用来存储文章热度、Visitor 用来统计友链访问次数，注意新建时选择表的访问权限无限制。**

![Leancloud_应用_Key](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Leancloud_应用_Key.png)

```javascript
/**
 * leancloud 配置 【文章浏览次数】
 */
leancloud: {
  appId: 'b6DWxsCOWuhurfp4YqbD5cDE-gzGzoHsz',
  appKey: 'h564RR5uVuJV5uSeP7oFTBye'
}
```

### 配置 Gitalk

Gitalk 是一个基于 GitHub Issue 和 Preact 开发的评论插件。其原理的文章存储是一样的，详细介绍见[官方文档](https://github.com/gitalk/gitalk/blob/master/readme-cn.md)。

首先需要申请 [GitHub Application](https://github.com/settings/applications/new)，跳转地址填写你的博客域名，如果你使用 github pages 来托管你的网站，你也可以使用 `https://chanshiyucx.github.io` 域名。最后将生成的 `Client ID` 和 `Client Secret` 填入相应配置项。**在开发环境调试时 Gitlak 无法展示是正常现象，发布到线上后会正常显示。**

![申请 GitHub Application](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/申请_GitHub_Application.png)

![生成 clientID 和 clientSecret](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/生成_clientID_和_clientSecret.png)

```javascript
/**
 * Gittalk 配置【评论功能】
 */
gitalk: {
  clientID: '864b1c2cbc4e4aad9ed8',
  clientSecret: '6ca16373efa03347e11a96ff92e355c5cea189bb',
  repo: 'Comment', // 你的评论仓库
  owner: 'chanshiyucx', // 你的 github 账户
  admin: ['chanshiyucx'], // 你的 github 账户
  distractionFreeMode: false // 是否开始无干扰模式【背景遮罩】
}
```

到此为止，所有主要的配置项皆已完成，剩下的几个配置项非常简单，相信你自己可以配置完善。

## 页面模板

为了更好地定制各个页面的展示效果，Aurora 约定一些页面格式以便内容能够正确解析。主要约定 `文章、书单、友链、关于` 四个页面内容模板。模板参考 [蝉時雨の Issues](https://github.com/chanshiyucx/blog/issues)。

### 文章模板

文章模板没有太多的格式约束，只需要在文章正文顶部加上封面配图即可，配图采用的是 markdown 的注释语法，所以并不会在正文里渲染，以后即使你更换博客主题，也不会影响内容的展示。

```text
JavaScript 秘密花园由两位 Stack Overflow 用户伊沃·韦特泽尔（写作）和张易江（设计）完成，由三生石上翻译完成，内容短小精炼。这次温故知新，做一番总结。
```

由于博客的文章、友链、书单、关于、心情等内容都放在 issues 里，所以需要对它们进行区分，这里主要使用 `issues 状态`与 `Labels` 进行分类。

首先需要规定的是**文章的 issues 状态都是 `open` 的，友链、书单、关于、心情页面的 issues 内容都是 `closed` 状态的**。

新建文章的时候 `Labels` 表示文章标签，`Milestone` 代表文章的分类，同时在文章正文顶部使用 markdown 注释来设置文章封面图，如下所示：

![文章模板](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/文章模板.png)

### 心情模板

注意心情 issues 状态是 `closed` 的，且需要打上 `Inspiration` 的 Labels，其他不做约束。

![书单、友链、关于标签](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/页面模板.png)

### 友链模板

友链页面使用空行做分割，内容示例如下：

```text
## 阁子

link: //newdee.cf/
cover: //i.loli.net/2018/12/15/5c14f329b2c88.png
avatar: //i.loli.net/2018/12/15/5c14f3299c639.jpg
```

### 书单模板

书单页面使用空行做分割，内容示例如下：

```text
## ES6 标准入门

author: 阮一峰
published: 2017-09-01
progress: 正在阅读...
rating: 5,
postTitle: ES6 标准入门
postLink: //chanshiyu.com/#/post/12
cover: //chanshiyu.com/poi/2019/ES6-标准入门.jpg
link: //www.duokan.com/book/169714
description: 柏林已经来了命令，阿尔萨斯和洛林的学校只许教 ES6 了...他转身朝着黑板，拿起一支粉笔，使出全身的力量，写了两个大字：“ES6 万岁！”（《最后一课》）。
```

### 关于模板

关于页面以 `## 段落` 拆分，其他不做约束。

### 添加分类

![添加分类](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/Aurora%E5%88%86%E7%B1%BB.png)

## 部署

修改根目录下 `deploy.sh`，配置自定义域名与推送仓库，然后执行 `deploy.sh` 自动打包发布到 github-pages。相关文档参考[自动部署](https://cli.vuejs.org/zh/guide/deployment.html#now)。

Just enjoy it! 😃
