# Vue 构建项目写入配置文件

## 获取命令行参数

读取 Node 命令行的参数：

```javascript
// getArgList.js 获取参数列表
module.exports = function getArgList() {
  let argvs
  const res = {}
  try {
    argvs = JSON.parse(process.env.npm_config_argv).original
  } catch (ex) {
    argvs = process.argv
  }
  const argv = argvs.slice(2)
  for (const i in argv) {
    const key = argv[i].match(/--(\S*)=/)[1]
    const value = argv[i].split('=')[1]
    res[key] = value
  }
  return res
}
```

## 将命令行参数写入文件

新建一个 `client.js` 脚本文件，将读取到的命令行参数写入 `setting.js` 文件：

```javascript
// client.js
const fs = require('fs')
const path = require('path')
const argList = require('./getArgList')()

// 构建配置参数
const site_url = argList.site_url || 'chanshiyu.com'
const site_id = argList.site_id || '500'

module.exports = {
  setStart() {
    this.setSetting()
  },
  setSetting() {
    console.log('argList==>', argList)
    const setting = {
      site_url,
      site_id
    }
    console.log('setting==>', setting)
    fs.writeFileSync(
      path.resolve(__dirname, '../public/setting.js'),
      'var setting = ' + JSON.stringify(setting)
    )
  }
}
```

## 执行并引入

在 `vue.config.js` 中引入并执行构建脚本：

```javascript
// vue.config.js
const client = require('./build/client')
client.setStart()
```

最后在 `index.html` 中引入生成的配置文件：

```markup
<script src="<%= BASE_URL %>setting.js?<%=Date.now()%>"></script>
```
