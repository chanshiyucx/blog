最近因为工作的原因，接触 Nodejs 也愈加多了起来，从搭建 koa2 后台服务器，到 PM2 管理各种服务进程，收获颇多，Nodejs 写起爬虫也是得心应手，趁此闲暇写了个P站图片爬虫小玩具。<!-- more -->

## 关于

`Pixiv-Spider` 是一个P站图片批量下载爬虫，其内集成了三种下载模式：收藏夹模式、关注者模式和作者列表模式，顾名思义，不同模式下会分别下载自己收藏夹的作品、关注的画师作品和自定义提供的画师列表的作品。不仅如此，还可以自定义各种下载筛选条件，包括作品发布日期、点赞数、标签和 R18 禁止。

项目地址: [Pixiv-Spider](//github.com/chanshiyucx/Pixiv-Spider)，欢迎 star ฅ●ω●ฅ。

食用方式非常简单，先克隆仓库并安装依赖包：

```bash
git clone git@github.com:chanshiyucx/Pixiv-Spider.git

cd Pixiv-Spider

npm install
```

待依赖包安装完毕，修改目录下的 `config.js` 配置文件，填写你的P站账号与密码，自定义下载模式和筛选条件：

```javascript
module.exports = {
  username: '你的 P 站账号',
  password: '你的 P 站密码',
  mode: 'author',  // star: 下载收藏夹, author: 下载作者列表, follow: 下载我关注的作者
  date: '',        // 限定日期之内, 可以留空, 注意格式: '2018/01/01'
  // 以下是 mode 为 author 或 follow 限定选项
  author: [],      // 下载的作者列表
  tags: [],        // 筛选标签
  rated: 0,        // 最低点赞数筛选
  R18: true,       // 是否禁止 R18
}
```

完成之后，执行 `npm start` 开始下载。到此，`Pixiv-Spider` 食用教程结束，余下内容分析一些功能的代码具体实现。

![收藏夹下载完成](https://dn-coding-net-production-pp.qbox.me/8020f48e-d18e-41b8-8134-10512af73ee0.png)

## 爬虫实现

### 启动

`Pixiv-Spider` 爬虫使用了 `axios` 发送请求， `cheerio` 解析 DOM，`bluebird` 封装的 `map` 函数进行多任务下载。首先，新建个爬虫类如下：

```javascript
const fs = require('fs')
const querystring = require('querystring')
const axios = require('axios')
const cheerio = require('cheerio')
const Promise = require('bluebird')

// 配置文件
const config = require('./config')
const { username, password, mode, author, tags, rated, date, R18 } = config

// 限制日期
const temp = (date || '2000/01/01').split('/')
const limitDate = new Date()
limitDate.setFullYear(+temp[0], +temp[1] - 1, +temp[2])

class Pixiv {
  constructor() {
    this.mode = mode
    this.cookie = ''
  }

  // 启动
  async start() {
    console.log("\n程序启动(●'◡'●)  DesignedBy 蝉時雨")
    let showTags = ''
    tags.forEach(o => { showTags += ` ${o}` })
    const inx = ['star', 'author', 'follow'].findIndex(o => o === mode)
    const showMode = ['收藏夹模式', '作者列表模式', '关注者模式'][inx]
    console.log(`当前模式：${showMode}  限定日期: ${date}  ${mode !== 'star' ? '筛选标签:' + showTags : ''}`)

    // 如果不存在下载目录则新建
    if (!fs.existsSync('download')) {
      fs.mkdirSync('download')
    }
    // 如果不存在 cookie 则登陆获取
    if (!fs.existsSync('cookie.txt')) {
      const key = await this.getKey()
      this.cookie = await this.login(key)
    } else {
      this.cookie = fs.readFileSync('cookie.txt', 'utf8')
    }

    if (this.mode === 'star') {
      // 收藏夹模式
    } else if (this.mode === 'author' && author.length) {
      // 作者列表模式
    } else if (this.mode === 'follow') {
      // 关注者模式
    }
  }

  // 开始启动
  const pixiv = new Pixiv()
  pixiv.start()
```

### 登陆

登陆部分代码参考了知乎一篇文章 [从零开始教你写一个NPM包](//zhuanlan.zhihu.com/p/29204311)，在登陆页面需要获取 `post_key`，P站使用了该值来防止 CSRF。

![获取登录 post_key](https://dn-coding-net-production-pp.qbox.me/01e6f7a2-b739-4120-80a2-dd3c51fc1903.png)

在登陆之后将 `cookie` 保存本地，下次执行脚本时就可以无需登陆，避免频繁登陆之后需要填写验证码的尴尬。

```javascript
// 登陆地址和 Api
const LOGIN_URL = '//accounts.pixiv.net/login?lang=zh&source=pc&view_type=page&ref=wwwtop_accounts_index'
const LOGIN_API = '//accounts.pixiv.net/api/login?lang=zh'

class Pixiv {
  // 获取登陆 key
  async getKey() {
    try {
      const res = await axios({
        method: 'get',
        url: LOGIN_URL,
        header: {
          'User-Agent': USER_AGENT
        }
      })
      const $ = cheerio.load(res.data)
      const postKey = $('input[name="post_key"]').val()
      const postCookie = res.headers['set-cookie'].join('; ')
      return { postKey, postCookie }
    } catch (err) {
      console.log(err)
    }
  }

  // 登陆
  async login({ postKey, postCookie }) {
    try {
      const res = await axios({
        method: 'post',
        url: LOGIN_API,
        headers: {
          'User_Agent': USER_AGENT,
          'Content_Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': '//accounts.pixiv.net',
          'Referer': '//accounts.pixiv.net/login?lang=zh&source=pc&view_type=page&ref=wwwtop_accounts_index',
          'X-Requested-With': 'XMLHttpRequest',
          'Cookie': postCookie
        },
        data: querystring.stringify({
          pixiv_id: username,
          password: password,
          captcha: '',
          g_recaptcha_response: '',
          post_key: postKey,
          source: 'pc',
          ref: 'wwwtop_accounts_index',
          return_to: '//www.pixiv.net/'
        })
      })
      const cookie = res.headers['set-cookie'].join('; ')
      // 将 cookie 写入文件
      fs.writeFileSync('cookie.txt', cookie)
      return cookie
    } catch (err) {
      console.log(err)
    }
  }
}
```

### 下载图片

在登陆之后便可以批量下载图片了，这里以最简单的收藏夹模式为例，按如下流程执行：

1. 获取收藏夹总页数
2. 获取其中一页的所有作品
3. 遍历每一个作品，分析是否只有一张图，分别执行步骤 4 或 5
4. 如果是一张图，直接转换地址下载
5. 如果是多图作品，进入详情页遍历所有图片并下载
6. 开始下载图片

当然这是最简单的流程模式，在下载过程的还需要根据配置文件判断是否进行日期、标签、点赞数、R18 等筛选。

```javascript
// 收藏夹、作品、管理页地址
const STAR_URL = '//www.pixiv.net/bookmark.php?rest=show&order=desc'
const IMG_URL = '//www.pixiv.net/member_illust.php?mode=medium&illust_id='
const MANAGE_URL = '//www.pixiv.net/member_illust.php?mode=manga_big&illust_id='
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'

class Pixiv {
  // 获取总页数
  async getPageSize(url) {
    try {
      const res = await axios({
        method: 'get',
        url: url,
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': '//www.pixiv.net',
          'Cookie': this.cookie
        }
      })
      const $ = cheerio.load(res.data)
      const pageList = $('.page-list')
      const pageSize = pageList.length ? pageList.children().last().find('a').text() : 1
      return pageSize
    } catch (err) {
      console.log(err)
    }
  }

  // 获取整页作品
  async getImgList(url) {
    try {
      const res = await axios({
        method: 'get',
        url: url,
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': '//www.pixiv.net',
          'Cookie': this.cookie
        }
      })
      const $ = cheerio.load(res.data)
      const list = $('._image-items').eq(0).find('.image-item')
      const imgList = []
      // 如果是下载作者列表，那么不需要每次都去获取作者，而且也获取不到
      let author
      if (this.mode !== 'star') {
        author = $('.user-name').text()
      }
      const self = this // 哎，老办法
      list.each(function () {
        const id = $(this).find('img').attr('data-id')
        const name = $(this).find('.title').text()
        author = author || $(this).find('.user').text()
        // 日期限制，从小图链接提取日期
        const src = $(this).find('img').attr('data-src')
        const suffix = src.split('/img-master/img/')[1]
        const publishedAt = (suffix.slice(0, 10)).split('/') // 2016/01/26
        const img = {
          id,
          name,
          author
        }
        const imgDate = new Date()
        // 表示月份的参数介于 0 到 11 之间, 需要减 1
        imgDate.setFullYear(+publishedAt[0], +publishedAt[1] - 1, +publishedAt[2])
        if (imgDate < limitDate) {
          self.outDate = true // 设置标记，不需要再遍历下一页了
        } else {
          imgList.push(img)
        }
      })
      return imgList
    } catch (err) {
      console.log(err)
    }
  }

  // 整理单个收藏
  async download({ id, name, author }) {
    // 根据下载记录判断是否必要下载
    if (this.mode !== 'star' && this.history.includes(id)) return
    try {
      const src = `${IMG_URL}${id}`
      const res = await axios({
        method: 'get',
        url: src,
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': '//www.pixiv.net/bookmark.php?rest=show&order=date_d',
          'Cookie': this.cookie
        }
      })
      const $ = cheerio.load(res.data)
      // R18 的禁用开关
      if (R18) {
        const tags = $('.tags-container .tags').find('.text').filter(function (i, el) {
          return $(this).text() === 'R-18'
        })
        if (tags && tags.length) {
          console.log('删除r18作品')
          return
        }
      }

      // 收藏夹不筛选，其他模式需要筛选
      if (this.mode !== 'star' && rated) {
        const ratedCount = parseInt($('.rated-count').text(), 10)
        if (ratedCount < rated) return
      }
      const readMore = $('.works_display').find('.read-more')
      if (!readMore.length) {
        // 不是图集，直接获取高清图
        const modal = $('._illust_modal')
        const imgUrl = modal.find('img').attr('data-src')
        await this.downloadImg({ id, name, author, imgUrl })
      } else {
        // 是图集，获取所有图片链接
        const more = readMore.text() // 查看更多（9枚）
        const num = /\d+/.exec(more)
        const count = parseInt(num[0], 10)
        for (let i = 0; i < count; i++) {
          const manageUrl = `${MANAGE_URL}${id}&page=${i}`
          await this.manage({ id, name, author, manageUrl })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  // 获取图集
  async manage({ id, name, author, manageUrl }) {
    try {
      const Referer = `//www.pixiv.net/member_illust.php?mode=manga&illust_id=${id}`
      const res = await axios({
        method: 'get',
        url: manageUrl,
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': Referer,
          'Cookie': this.cookie
        }
      })
      const $ = cheerio.load(res.data)
      const imgUrl = $('img').attr('src')
      await this.downloadImg({ id, name, author, imgUrl })
    } catch (err) {
      console.log(err)
    }
  }

  // 下载图片
  async downloadImg({ id, name, author, imgUrl }) {
    if (!imgUrl) {
      console.log(`图片 ${id} 解析错误，请检查知悉！`)
      return
    }
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: imgUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': '//www.pixiv.net/bookmark.php?rest=show&order=date_d',
          'Cookie': this.cookie
        }
      }).then(res => {
        if (!this.history.length && this.mode !== 'star') {
          // 判断是否存在该作者的目录
          const authorPath = `download/${this.author}`
          if (!fs.existsSync(authorPath)) {
            fs.mkdirSync(authorPath)
          }
        }

        const fileName = imgUrl.substring(imgUrl.lastIndexOf('/') + 1)
        const savePath = this.mode === 'star' ? `download/star/${fileName}` : `download/${this.author || 'default'}/${fileName}`
        res.data.pipe(fs.createWriteStream(savePath)).on('close', () => {
          console.log(`下载完成: 文件: ${fileName}    作品: ${name}    画师：${author}`)
          // 下载完成保存，避免重复下载
          if (this.mode !== 'star') this.history.push(id)
          resolve()
        })
      }).catch(err => reject(err))
    }).catch(console.err)
  }
}
```

至于关注者模式和作者列表模式与收藏夹模式大同小异，只是在下载之前多了两次遍历过程，如有兴趣可直接看仓库代码。

Just enjoy it ฅ●ω●ฅ

参考文章：  
[从零开始教你写一个 NPM 包](//zhuanlan.zhihu.com/p/29204311)
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTExMTUwMDU1NTFdfQ==
-->