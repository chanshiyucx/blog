# jsDelivr 全站托管

可能是自己消息闭塞，近日才知道 jsDelivr 可以访问 github 仓库资源，并通过 CDN 缓存方式加速国内的访问。于是查阅资料略加研究，决定将全站进行 jsDelivr 托管。

## github 图床

现在使用 github pages 服务来托管静态博客已是屡见不鲜，更甚者使用 github 仓库来搭建图床也是可行。之前自己用过的几款外链图床如 coding 图床、SMMS 图床都有些许问题。coding 图床启用了防盗链后无法访问且无法快捷上传图片，SMMS 图床上传的图片间歇性莫名其妙 404。

综于以上原因，迫于对稳定的考量，后来使用 github 仓库作为外链图床，本着 github 全家桶的思想，一条龙服务不也挺好的嘛。

当然 github 图床也面临两个问题，一是仓库大小容量有 1G 限制；二是国内访问速度堪忧。

第一个问题很好解决，虽然一个仓库大小有限制，但是可以通过创建多个仓库的方式来解决容量问题，而且即使一个仓库 1G 容量对于小博客其实也足够使用了。

第二个问题就比较难办，由于种种原因，github 在国内访问速度受限，加载速度堪忧，用作图床更是细流难以解渴。

## jsDelivr 加速

通过开源 CDN 服务 jsDelivr 引用一些静态资源可以加快网站加载速度，但鲜有人知的是，jsDelivr 还可以直接访问 github 上的资源。自听闻这种技巧之后，便查阅官方资料，犹如久旱逢甘霖，立马着手将整个博客进行 jsDelivr CDN 加速。

jsDelivr 提供 npm，GitHub，WordPress 等项目的镜像。由于我只使用 Github 来托管文件，所以只对这种方式做说明。

使用 github 做图床，我们可以通过 [PicGo](https://github.com/Molunerfinn/PicGo) 或者 chrome 插件 [Picee](https://chrome.google.com/webstore/detail/picee/nmeeieecbmdnilkkaliknhkkakonobbc) 来上传图片到图片仓库。举个栗子，这里我上传图片到名为 poi 的 github 仓库中，上传成功后图片访问地址类似如下格式：

```
https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/1.jpg
```

如果你有绑定自有域名，也可以通过绑定域名来访问：

```
https://chanshiyu.com/yoi/2019/1.jpg
```

然后便可以使用 jsDelivr CDN 加速访问图片，格式如下：

```
https://cdn.jsdelivr.net/gh/user/repo@version/file
```

具体到上传的这张图片地址便是：

```
https://cdn.jsdelivr.net/gh/chanshiyucx/yoi/2019/1.jpg
```

泪，一下子就流了下来 இ௰இ

## 全站 jsDelivr 托管

根据上述方式将博客图片资源进行 jsDelivr 托管之后，琢磨了一下，除了图片资源外，为什么不把全站资源包括 js、css 等文件都进行 CDN 加速呢，于是手动改造了 Aurora，除了 index.html 外，其他全部引用资源文件走 CDN 加速。

博客文件托管只需将修改 `vue.config.js` 中静态资源路径配置即可，将其修改为你的博客 pages 仓库，然后重新打包部署，全站 CDN 加速岂不美哉。

```js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? `//cdn.jsdelivr.net/gh/chanshiyucx/chanshiyucx.github.io/` : '/'
}
```

Just enjoy it! 😃

参考文档：  
[Jsdelivr Features](https://www.jsdelivr.com/features)
