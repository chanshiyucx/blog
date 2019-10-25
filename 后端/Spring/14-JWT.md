# JWT

JWT 是 JSON WEB TOKEN 的缩写，它是基于 RFC 7519 标准定义的一种可以安全传输的的 JSON 对象，由于使用了数字签名，所以是可信任和安全的。

## JWT 的组成

JWT token 的格式：`header.payload.signature`。

- header（头部）
- payload（负载）
- signature（签名）

header 中用于存放签名的生成算法：

```
{"alg": "HS512"}
```

payload 中用于存放用户名、token 的生成时间和过期时间，jwt 默认不加密，注意不要将秘密信息放在这个部分：

```
{"sub": "admin", "created": 1489079981393, "exp": 1489684781}
```

signature 为以 header 和 payload 生成的签名，需要指定一个密钥 secret：

```
String signature = HMACSHA512(base64UrlEncode(header) + "." +base64UrlEncode(payload), secret)
```

可以在 [https://jwt.io/](https://jwt.io/) 解析 token：

```
eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImNyZWF0ZWQiOjE1NzA1MDEwMTQwOTUsImV4cCI6MTU3MTEwNTgxNH0.Tq9LIqSu8cet6ToqpTxS-sdY6bsCm0mWUFwKSgy5d0EovH4DYLxxqfswJpmibBNG0Ds2W0hM5D8BjVHHFeTTrg
```

![jwt token 解析](https://cdn.jsdelivr.net/gh/chanshiyucx/poi/2019/token%E8%A7%A3%E6%9E%90.png)

## JWT 的使用方式

1. 用户调用登录接口，登录成功后获取到 JWT 的 token；
2. 之后用户每次调用接口都在 http 的 header 中添加一个叫 `Authorization` 的头，值为 JWT 的 token；
3. 后台程序通过对 `Authorization` 头中信息的解码及数字签名校验来获取其中的用户信息，从而实现认证和授权。

```
Authorization: Bearer <token>
```

## JWT 的特点

- JWT 默认是不加密，但也是可以加密的。生成原始 Token 以后，可以用密钥再加密一次。
- JWT 不加密的情况下，不能将秘密数据写入 JWT。
- JWT 不仅可以用于认证，也可以用于交换信息。有效使用 JWT，可以降低服务器查询数据库的次数。
- JWT 的最大缺点是，由于服务器不保存 session 状态，因此无法在使用过程中废止某个 token，或者更改 token 的权限。也就是说，一旦 JWT 签发了，在到期之前就会始终有效，除非服务器部署额外的逻辑。
- JWT 本身包含了认证信息，一旦泄露，任何人都可以获得该令牌的所有权限。为了减少盗用，JWT 的有效期应该设置得比较短。对于一些比较重要的权限，使用时应该再次对用户进行认证。
- 为了减少盗用，JWT 不应该使用 HTTP 协议明码传输，要使用 HTTPS 协议传输。
