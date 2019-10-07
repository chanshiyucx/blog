# Spring Security oAuth2

oAuth 协议为用户资源的授权提供了一个安全的、开放而又简易的标准。Spring Security 实现了 oAuth 协议。

## 简介

oAuth 在 "客户端" 与 "服务提供商" 之间，设置了一个授权层（authorization layer）。"客户端" 不能直接登录 "服务提供商"，只能登录授权层，以此将用户与客户端区分开来。"客户端" 登录授权层所用的令牌（token），与用户的密码不同。用户可以在登录的时候，指定授权层令牌的权限范围和有效期。"客户端" 登录授权层以后，"服务提供商" 根据令牌的权限范围和有效期，向 "客户端" 开放用户储存的资料。

![oAuth2 交互过程](https://raw.githubusercontent.com/chanshiyucx/poi/master/2019/oAuth2%E4%BA%A4%E4%BA%92%E8%BF%87%E7%A8%8B.png)

## 令牌的访问与刷新

### Access Token

Access Token 是客户端访问资源服务器的令牌。拥有这个令牌代表着得到用户的授权。然而，这个授权应该是临时的，有一定有效期。这是因为 Access Token 在使用的过程中可能会泄露。给 Access Token 限定一个**较短的有效期**可以降低因 Access Token 泄露而带来的风险。

然而引入了有效期之后，客户端使用起来就不那么方便了。每当 Access Token 过期，客户端就必须重新向用户索要授权。这样用户可能每隔几天，甚至每天都需要进行授权操作。这是一件非常影响用户体验的事情。希望有一种方法，可以避免这种情况。于是 oAuth2.0 引入了 Refresh Token 机制。

### Refresh Token

Refresh Token 的作用是用来刷新 Access Token。认证服务器提供一个刷新接口，例如：

```
http://www.funtl.com/refresh?refresh_token=&client_id=
```

传入 `refresh_token` 和 `client_id`，认证服务器验证通过后，返回一个新的 Access Token。为了安全，oAuth2.0 引入了两个措施：

1. oAuth2.0 要求 Refresh Token 一定是保存在客户端的服务器上，而绝不能存放在狭义的客户端（例如 App、PC 端软件）上。调用 refresh 接口的时候，**一定是从服务器到服务器的访问**。
2. oAuth2.0 引入了 `client_secret` 机制。即每一个 `client_id` 都对应一个 `client_secret`。这个 `client_secret` 会在客户端申请 `client_id` 时，随 `client_id` 一起分配给客户端。客户端必须把 `client_secret` 妥善保管在服务器上，决不能泄露。刷新 Access Token 时，需要验证这个 `client_secret`。

实际上的刷新接口类似于：

```
http://www.funtl.com/refresh?refresh_token=&client_id=&client_secret=
```

以上就是 Refresh Token 机制。Refresh Token 的有效期非常长，会在用户授权时，随 Access Token 一起重定向到回调 URL，传递给客户端。

## 客户端授权模式
