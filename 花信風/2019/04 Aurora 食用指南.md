[author: kieta]: # 'https://i.loli.net/2019/04/23/5cbf0e0d65fa1.jpg'

距离 Aurora 主题发布有一段时间了，懒癌发作也没有好好写一篇使用文档，一直以为主题无人问津。近来有人问起如何食用该主题，忙里偷闲摸一篇简单食用文档。

相较于 Wordpress 和 Typecho 等博客框架，Aurora 主题最大的优势就是空手套白狼，全部使用现成的免费服务，而且相对稳定，也不怕 Github 跑路（笑），文章发布与更新也是相当简单，不需要操作服务器与数据库，对新人来说非常友好。

## 初始化环境

在食用 Aurora 主题之前，需先安装 Nodejs 和 Git 环境，这两步不必细说。环境安装完毕，由于 Aurora 使用 vue 开发，所以需要安装 `vue-cli`。

```bash
npm install -g @vue/cli-service-global
```

然后将主题 clone 到本地并安装依赖包：

```bash
# clone 主题
git@github.com:chanshiyucx/aurora.git

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

```html
<!-- 替换成你自己的网站标题 -->
<title>蝉時雨</title>
```

## 配置主题

主题配置文件为主题根目录下 `src/config` 文件，每个配置项皆有注释，这里对一些基本配置项做简要说明。

### 配置文章仓库

Aurora 使用 Github api 做后台数据托管。所以需要新建一个仓库来存放文章和一些自定义页面内容。比如新建一个 Blog 仓库。

由于 Github api 有访问次数限制，所以需要申请 token 来解除访问限制，[申请地址戳这里](https://github.com/settings/tokens/new)。将生成的 token 从中间随意拆成两部分填入配置项，拆分的目的是进行代码提交的时候 github 会进行检测，发现代码里包含 token，则该 token 就会失效。

![Github Token](https://i.loli.net/2019/03/05/5c7df5acb52c9.png)

```javascript
// github 用户名
username: 'chanshiyucx',
 // 仓库地址
repository: 'blog',
// token 从中间任意位置拆开成两部分，避免 github 代码检测失效
token: ['0ad1a0539c5b96fd18fa', 'aaafba9c7d1362a5746c'],
```

### 配置 Leancloud

Aurora 文章的热度，即阅读次数使用的是 [Leancloud](https://leancloud.cn/) 存储。注册一个 Leancloud 账号并新建一个应用，将应用 key 填入相应配置项， **同时创建三个 Class，Comment 用来存储游客评论、Counter 用来存储文章热度、Visitor 用来统计友链访问次数，注意新建时选择访问权限无限制。**

![Leancloud 应用 Key](https://i.loli.net/2019/03/05/5c7e26e25047f.png)

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

首先需要申请 [GitHub Application](https://github.com/settings/applications/new)，跳转地址填写你的博客域名，如果你使用 github pages 来托管你的网站，你也可以使用 `https://chanshiyucx.github.io` 域名。最后将生成的 `Client ID` 和 `Client Secret` 填入相应配置项。

![申请 GitHub Application](https://i.loli.net/2019/03/05/5c7df5accea95.png)

![生成 clientID 和 clientSecret](https://i.loli.net/2019/03/05/5c7e26e246cf9.png)

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

### Valine

由于 Gitalk 评论需要登录 Github 账号，不少小伙伴反应非常不方便，所以新增了 Valine 评论系统，其原理同文章热度一样存储在 LeanCloud 上，需要自行前往配置，详见[官方文档](https://github.com/DesertsP/Valine-Admin)。

## 页面模板

为了更好地解析与展现文章、关于、友链、书单等页面内容，Aurora 制定了一些约定规范。如果新增的文章或者页面格式不符合规范，可能会出现无法解析内容导致页面无限 loading，这点非常重要，故这里详细说明一下约定规范。或者参考[我的 Blog 仓库](https://github.com/chanshiyucx/blog/issues)。

### 文章模板

首先需要约束的是**文章的 issues 状态都是 `open` 状态，心情、友链、书单、关于页面的 issues 内容都是 `closed` 状态**。

新建文章 issues 的时候 `Labels` 表示文章标签，`Milestone` 代表文章的分类。同时在文章内容第一段落使用 markdown 注释来设置文章封面图，如下所示：

```markdown
[pixiv: 41652582]: # 'https://i.loli.net/2018/12/09/5c0cc1c2ea2e4.jpg'

JavaScript 秘密花园由两位 Stack Overflow 用户伊沃·韦特泽尔（写作）和张易江（设计）完成，由三生石上翻译完成，内容短小精炼。这次温故知新，做一番总结。
```

`pixiv: 41652582` 这部分不做约束，不过带上作者或者 P 站 id 那是最好的：

```markdown
[author: sanntouhei]: # 'https://i.loli.net/2018/12/17/5c17ae05b3176.jpg'
```

### 心情模板

发布心情和文章在同一个仓库，不过心情 issues 状态是 `closed` 的，且需要打上 `Mood` 的 Labels，其他不做约束。

### 友链模板

友链约束规则如下，使用空行做分割，可无限添加，模板参考：[友链模板](https://github.com/chanshiyucx/blog/issues/5)。

```markdown
## 阁子

link: //newdee.cf/
cover: //i.loli.net/2018/12/15/5c14f329b2c88.png
avatar: //i.loli.net/2018/12/15/5c14f3299c639.jpg
```

### 书单模板

书单约束规则如下，使用空行做分割，可无限添加，模板参考：[书单模板](https://github.com/chanshiyucx/blog/issues/4)。

```markdown
## ES6 标准入门

author:阮一峰
published:2017-09-01
progress:正在阅读...
rating:5,
postTitle: ES6 标准入门
postLink: //chanshiyu.com/#/post/12
cover://i.loli.net/2018/12/10/5c0dcb80d3615.jpg
link://www.duokan.com/book/169714
desc:柏林已经来了命令，阿尔萨斯和洛林的学校只许教 ES6 了...他转身朝着黑板，拿起一支粉笔，使出全身的力量，写了两个大字：“ES6 万岁！”（《最后一课》）。
```

## 关于模板

关于页面以 `## 段落` 拆分，可无限添加，模板参考：[关于模板](https://github.com/chanshiyucx/blog/issues/3)。

至此，一个新的博客便诞生了，之后便可执行 `npm run build` 进行打包，打包完成之后，将 Aurora 根目录 `dist/` 文件夹下的为所有文件复制到一个新文件夹，然后提交托管到 `Github pages` 上，当然也可以绑定自有域名。

如果需要绑定自有域名，需要编辑 Aurora 根目录下 `public/CHNAME` 内容为你的域名，**并且到修改你的域名 DNS 解析到 Github ip**。然后重新打包，发布到 Github 上。

Just enjoy it! 😃
