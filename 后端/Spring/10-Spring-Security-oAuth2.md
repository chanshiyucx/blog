# Spring Security oAuth2

oAuth 协议为用户资源的授权提供了一个安全的、开放而又简易的标准。Spring Security 实现了 oAuth 协议。

## oAuth2

oAuth 在 "客户端" 与 "服务提供商" 之间，设置了一个授权层（authorization layer）。"客户端" 不能直接登录 "服务提供商"，只能登录授权层，以此将用户与客户端区分开来。"客户端" 登录授权层所用的令牌（token），与用户的密码不同。用户可以在登录的时候，指定授权层令牌的权限范围和有效期。"客户端" 登录授权层以后，"服务提供商" 根据令牌的权限范围和有效期，向 "客户端" 开放用户储存的资料。

![oAuth2 交互过程](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Spring-Security-oAuth2/oAuth2交互过程.png)

## 令牌的访问与刷新

### Access Token

Access Token 是客户端访问资源服务器的令牌。拥有这个令牌代表着得到用户的授权。然而，这个授权应该是临时的，有一定有效期。这是因为 Access Token 在使用的过程中可能会泄露。给 Access Token 限定一个**较短的有效期**可以降低因 Access Token 泄露而带来的风险。

然而引入了有效期之后，客户端使用起来就不那么方便了。每当 Access Token 过期，客户端就必须重新向用户索要授权。这样用户可能每隔几天，甚至每天都需要进行授权操作。这是一件非常影响用户体验的事情。希望有一种方法，可以避免这种情况。于是 oAuth2.0 引入了 Refresh Token 机制。

### Refresh Token

Refresh Token 的作用是用来刷新 Access Token。认证服务器提供一个刷新接口，例如：

```
http://www.funtl.com/refresh?refresh_token=&client_id=
```

传入 `refresh_token` 和 `client_id`，认证服务器验证通过后，返回一个新的 `access_token`。为了安全，oAuth2.0 引入了两个措施：

1. oAuth2.0 要求 Refresh Token 一定是保存在客户端的服务器上，而绝不能存放在狭义的客户端（例如 App、PC 端软件）上。调用 refresh 接口的时候，**一定是从服务器到服务器的访问**。
2. oAuth2.0 引入了 `client_secret` 机制。即每一个 `client_id` 都对应一个 `client_secret`。这个 `client_secret` 会在客户端申请 `client_id` 时，随 `client_id` 一起分配给客户端。客户端必须把 `client_secret` 妥善保管在服务器上，决不能泄露。刷新 Access Token 时，需要验证这个 `client_secret`。

实际上的刷新接口类似于：

```
http://www.funtl.com/refresh?refresh_token=&client_id=&client_secret=
```

以上就是 Refresh Token 机制。Refresh Token 的有效期非常长，会在用户授权时，随 Access Token 一起重定向到回调 URL，传递给客户端。

## 客户端授权模式

客户端必须得到用户的授权（authorization grant），才能获得令牌（access_token）。oAuth 2.0 定义了四种授权方式。

- implicit：简化模式，不推荐使用
- authorization code：授权码模式
- resource owner password credentials：密码模式
- client credentials：客户端模式

### 简化模式

简化模式适用于纯静态页面应用。这种场景下，应用是没有持久化存储的能力的。因此，按照 oAuth2.0 的规定，这种应用是拿不到 `refresh_token` 的，`access_token` 容易泄露且不可刷新。其整个授权流程如下：

![oAuth2简化模式](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Spring-Security-oAuth2/oAuth2简化模式.png)

### 授权码模式

授权码模式适用于有自己的服务器的应用，它是一个一次性的临时凭证，用来换取 `access_token` 和 `refresh_token`。认证服务器提供了一个类似这样的接口：

```
https://www.funtl.com/exchange?code=&client_id=&client_secret=
```

需要传入 `code`、`client_id` 以及 `client_secret`。验证通过后，返回 `access_token` 和 `refresh_token`。一旦换取成功，`code` 立即作废，不能再使用第二次。流程图如下：

![oAuth2授权码模式](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Spring-Security-oAuth2/oAuth2授权码模式.png)

这个 code 的作用是保护 token 的安全性。简单模式下，token 是不安全的。这是因为在第 4 步当中直接把 token 返回给应用。而这一步容易被拦截、窃听。引入了 code 之后，即使攻击者能够窃取到 code，但是由于他无法获得应用保存在服务器的 `client_secret`，因此也无法通过 code 换取 token。而第 5 步，为什么不容易被拦截、窃听呢？这是因为，首先，这是一个从服务器到服务器的访问，黑客比较难捕捉到；其次，这个请求通常要求是 https 的实现。即使能窃听到数据包也无法解析出内容。

有了这个 code，token 的安全性大大提高。因此，oAuth2.0 鼓励使用这种方式进行授权。

### 密码模式

密码模式中，用户向客户端提供自己的用户名和密码。客户端使用这些信息，向 "服务商提供商" 索要授权。在这种模式中，用户必须把自己的密码给客户端，但是客户端不得储存密码。这通常用在用户对客户端高度信任的情况下，比如客户端是操作系统的一部分。

![oAuth2密码模式](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Spring-Security-oAuth2/oAuth2密码模式.png)

### 客户端模式

如果信任关系再进一步，或者调用者是一个后端的模块，没有用户界面的时候，可以使用客户端模式。鉴权服务器直接对客户端进行身份验证，验证通过后，返回 token。

![oAuth2客户端模式](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/Spring-Security-oAuth2/oAuth2客户端模式.png)
