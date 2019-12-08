# RN App 外部唤醒踩坑记

公司新企划的 RN 项目需要实现链接分享功能，用户直接通过分享链接唤醒 App 并跳转相应页面，同时该功能要求在 iOS 和 Android 双端兼容，在此记录下拥抱新技术的踩坑历程。

## Universal Links

在 iOS 中，唤醒功能是通过 Universal Links 来实现。Universal Links 通用链接是 Apple 在 2015 推出的一个新功能，只有在 iOS9 以上才支持。如果你的 App 支持 Universal Links，那就可以访问 HTTP/HTTPS 链接直接唤起 APP 进入具体页面，不需要其他额外判断；如果未安装 App，访问此通用链接时可以一个自定义网页。

关于如何添加 Universal Links 来唤醒 App，Apple 官方文档 [Support Universal Links](https://developer.apple.com/library/content/documentation/General/Conceptual/AppSearch/UniversalLinks.html) 中虽然有了说明，但是具体的细节操作却未交代清楚，致使我走了不少弯路。其实到最后发现具体实现其实很简单，大体来说分三步。

### 添加验证域名

激活 Xcode 工程中的 `Associated Domains` ，需要填入想要支持的域名，必须以 `applinks:` 为前缀，Apple 将会在合适的时候，从这个域名请求验证文件。

![添加验证域名](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/RN-App-外部唤醒踩坑记/添加验证域名.jpg)

### 上传验证文件

新建一个 json 格式的验证文件命名为 `apple-app-site-association` ，注意不要加 .json 后缀，然后编辑验证内容如下：

```javascript
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "RFD4R6TMUT.org.reactjs.native.HAD",
        "paths": ["/url"]
      }
    ]
  }
}
```

上面需要修改的地方只有 `appId` 和 `paths`，其中 `appID` 由 `TeamId` 和 `Bundle Identifier` 两部分相加组成，即 `appID = TeamId.Bundle Identifier`。进入 Apple Developer 网站，找到 `Certificates, IDs & Profiles --> App IDs`，查阅便可获得：

![Apple Developer 获取 ID](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/RN-App-外部唤醒踩坑记/Apple_Developer.jpg)

如果上传成功后，可以进行先行[在线验证](https://branch.io/resources/aasa-validator/)。

### 处理 URL 跳转

修改 `AppDelegate.m`，添加内容如下：

```objectivec
#import <React/RCTLinkingManager.h>

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}
```

## App Links

在 Android 中，唤醒功能是通过 App Links 来实现。App Links 是谷歌在 Android M 之后推出的一个新功能，在此之前，点击一个链接会产生一个弹出框，询问用户打开哪个应用（包括浏览器应用）。但是谷歌在 Android M 实现了一个自动认证（auto-verify）机制，让开发者可以避开这个弹出框，使用户不必去选择一个列表，直接跳转到他们的 app。

App Links 和 Universal Links 实现大同小异，也是通过上传文件进行验证，在 app 第一次安装或更新后第一次打开时候，会自动下载服务器的文件然后进行验证。

### 激活 App Links

在使用 App Links 之前，需要先激活，修改 `AndroidManifest.xml`，增加一个 `intent-filter`，设置自动验证 `android:autoVerify="true"`，然后填写验证域名和需要唤醒的路径。这样 APP 就会自动在所列的 host 中去验证，如果验证成功，APP 将成为匹配 URI 默认打开方式。

```markup
<activity
  android:name=".MainActivity"
  android:label="@string/app_name"
  android:configChanges="keyboard|keyboardHidden|orientation|screenSize"
  android:windowSoftInputMode="adjustResize">

  <!-- 添加 intent-filter -->
  <intent-filter android:autoVerify="true">
    <!-- action 和 category 必须如下填写 -->
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <!-- 填写验证域名和需要唤醒的路径 -->
    <data
      android:scheme="https"
      android:host="airi.me"
      android:pathPrefix="/url" />
  </intent-filter>
</activity>
```

### 上传验证文件

新建一个验证文件命名为 `assetlinks.json`，编辑 `assetlinks.json` 如下：

```javascript
;[
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.had',
      sha256_cert_fingerprints: ['C1:96:B8:EB:AC:BD:6C:B3:03:...:7E:13:CC:0B:EE:50:80:5D:DA:81']
    }
  }
]
```

其中需要修改的只有包名 `package_name` 和 `sha256_cert_fingerprints`，其中包名在 `AndroidManifest.xml` 里可以找到，`sha256_cert_fingerprints` 需要在密钥里面获取。

在 Windows 上 keytool 命令放在 JDK 的 bin 目录中（比如 `C:\Program Files\Java\jdkx.x.x_x\bin`），需要在命令行中先进入那个目录才能执行此命令。

```bash
keytool -list -v -keystore  had.jks
```

验证文件编辑上传完成后，可以先行[在线验证](https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=/airi.me)。

## RN Linking 模块

React Native 通过 `Linking` 模块提供了一个通用的接口来与传入和传出的 App 链接进行交互。如果你的应用被其注册过的外部 url 调起，则可以在任何组件内获取和处理它：

```javascript
// 组件内监听 Url 跳转
componentDidMount() {
  Linking.getInitialURL()
    .then(url => {
      this.navigate(url)
    })
    .catch(console.error)

  Linking.addEventListener('url', this.appWokeUp)
}

componentWillUnmount() {
  Linking.removeEventListener('url', this.appWokeUp)
}

appWokeUp = event => {
  this.navigate(event.url)
}

navigate = url => {
  // dosomething
}
```

参考文章：  
[唤醒 APP 的那些事](//www.jianshu.com/p/862885bd8ea2)  
[Universal Linking For React-Native with Rails API, and Deep Linking Android](//github.com/parkerdan/React-Native-Rails-Universal-Linking)  
[Universal Links, URI Schemes, App Links, and Deep Links: What’s the Difference?](//blog.branch.io/universal-links-uri-schemes-app-links-and-deep-links-whats-the-difference)
