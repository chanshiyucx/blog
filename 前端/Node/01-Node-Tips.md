# Node Tips

## 001 获取 Node 命令行执行参数列表

```javascript
module.exports = function getArgList() {
  let argvs
  const res = {}
  try {
    argvs = JSON.parse(process.env.npm_config_argv).original
  } catch (ex) {
    // process 是一个全局变量，可通过 process.argv 获得命令行参数
    argvs = process.argv
  }
  // argv[0] 固定等于 NodeJS 执行程序的绝对路径，argv[1] 固定等于主模块的绝对路径
  const argv = argvs.slice(2)
  for (const i in argv) {
    const key = argv[i].match(/--(\S*)=/)[1]
    const value = argv[i].split('=')[1]
    res[key] = value
  }
  return res
}
```
