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

![token 解析](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/JWT/token解析.png)

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

## Token 认证的优势

相比于 Session 认证的方式来说，使用 token 进行身份认证主要有以下几个优势：

### 无状态

token 自身包含了身份验证需要的所有信息，使得服务器不需要存储 Session 信息，这显然增加了系统的可用性和伸缩性，大大减轻了服务端的压力。但是，也正是由于 token 的无状态，也导致了它最大的缺点：当后端在 token 有效期内废弃一个 token 或者更改它的权限的话，不会立即生效，一般需要等到有效期过后才可以。另外，当用户 Logout 的话，token 也还有效。除非，我们在后端增加额外的处理逻辑。

### 有效避免了 CSRF 攻击

**CSRF（Cross Site Request Forgery）**，即跨站请求伪造，属于网络攻击领域范围。什么是跨站请求伪造呢？简单来说就是用你的身份去发送一些对你不友好的请求。举个栗子：

小壮登录了某网上银行，他来到了网上银行的帖子区，看到一个帖子下面有一个链接写着“科学理财，年盈利率过万”，小壮好奇的点开了这个链接，结果发现自己的账户少了 10000 元。这是这么回事呢？原来黑客在链接中藏了一个请求，这个请求直接利用小壮的身份给银行发送了一个转账请求,也就是通过你的 Cookie 向银行发出请求。

```html
<a src=http://www.mybank.com/Transfer?bankId=11&money=10000>科学理财，年盈利率过万</>
```

导致这个问题很大的原因就是：Session 认证中 Cookie 中的 session_id 是由浏览器发送到服务端的，借助这个特性，攻击者就可以通过让用户误点攻击链接，达到攻击效果。

那为什么 token 不会存在这种问题呢？

一般情况下我们使用 JWT 的话，在登录成功获得 token 之后，一般会选择存放在 local storage 中。然后前端在请求头部加上这个 token，这样就不会出现 CSRF 漏洞的问题。因为，即使有个你点击了非法链接发送了请求到服务端，这个非法请求是不会携带 token 的，所以这个请求将是非法的。

但是这样会存在 XSS 攻击中被盗的风险，为了避免 XSS 攻击，你可以选择将 token 存储在标记为 httpOnly 的 cookie 中。但是，这样又导致了你必须自己提供 CSRF 保护。

具体采用上面哪两种方式存储 token 呢，大部分情况下存放在 local storage 下都是最好的选择，某些情况下可能需要存放在标记为 httpOnly 的 cookie 中会更好。

### 适合移动端应用

使用 Session 进行身份认证的话，需要保存一份信息在服务器端，而且这种方式会依赖到 Cookie（需要 Cookie 保存 SessionId），所以不适合移动端。

但是，使用 token 进行身份认证就不会存在这种问题，因为只要 token 可以被客户端存储就能够使用，而且 token 还可以跨语言使用。

### 单点登录友好

使用 Session 进行身份认证的话，实现单点登录，需要我们把用户的 Session 信息保存在一台电脑上，并且还会遇到常见的 Cookie 跨域的问题。但是，使用 token 进行认证的话，token 被保存在客户端，不会存在这些问题。

## Token 认证常见问题

注销登录等场景下 token 还有效，与之类似的具体相关场景有：

- 退出登录；
- 修改密码；
- 服务端修改了某个用户具有的权限或者角色；
- 用户的帐户被删除/封停/注销；

这个问题不存在于 Session 认证方式中，因为在 Session 认证方式中，遇到这种情况的话服务端删除对应的 Session 记录即可。但是，使用 token 认证的方式就不好解决了。因为 token 一旦派发出去，如果后端不增加其他逻辑的话，它在失效之前都是有效的。那么如何解决这个问题呢？总结了下面几种方案：

- **将 token 存入内存数据库**：将 token 存入 DB 中，比如 redis 内存数据库。如果需要让某个 token 失效就直接从 redis 中删除这个 token 即可。但是，这样会导致每次使用 token 发送请求都要先从 DB 中查询 token 是否存在的步骤，而且违背了 JWT 的无状态原则。
- **黑名单机制**：和上面的方式类似，使用内存数据库比如 redis 维护一个黑名单，如果想让某个 token 失效的话就直接将这个 token 加入到黑名单即可。然后，每次使用 token 进行请求的话都会先判断这个 token 是否存在于黑名单中。
- **修改密钥（Secret）**：为每个用户都创建一个专属密钥，如果我们想让某个 token 失效，我们直接修改对应用户的密钥即可。但是，这样相比于前两种引入内存数据库带来了危害更大，比如：如果服务是分布式的，则每次发出新的 token 时都必须在多台机器同步密钥。为此，你需要将必须将密钥存储在数据库或其他外部服务中，这样和 Session 认证就没太大区别了。如果用户同时在两个浏览器打开系统，或者在手机端也打开了系统，如果它从一个地方将账号退出，那么其他地方都要重新进行登录，这是不可取的。
- **保持令牌的有效期限短并经常轮换**：很简单的一种方式。但是，会导致用户登录状态不会被持久记录，而且需要用户经常登录。

对于修改密码后 token 还有效问题的解决还是比较容易的，可以使用用户的密码的哈希值对 token 进行签名。因此，如果密码更改，则任何先前的令牌将自动无法验证。

## Session 和 Token 认证对比

### Session 认证图解

![Session 认证图解](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/JWT/Session_认证图解.png)

- 用户向服务器发送用户名和密码用于登陆系统。
- 服务器验证通过后，服务器为用户创建一个 Session，并将 Session 信息存储起来。
- 服务器向用户返回一个 SessionID，写入用户的 Cookie。
- 当用户保持登录状态时，Cookie 将与每个后续请求一起被发送出去。
- 服务器可以将存储在 Cookie 上的 Session ID 与存储在内存中或者数据库中的 Session 信息进行比较，以验证用户的身份，返回给用户客户端响应信息的时候会附带用户当前的状态。

### Token 认证图解

![Token 认证图解](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/JWT/Token_认证图解.png)

- 用户向服务器发送用户名和密码用于登陆系统。
- 身份验证服务响应并返回了签名的 JWT，上面包含了用户是谁的内容。
- 用户以后每次向后端发请求都在 Header 中带上 JWT。
- 服务端检查 JWT 并从中获取用户相关信息。

## JWT 与 Token+Redis

注意区分 JWT 与 Token+Redis 是两种不同的方案：

JWT：生成并发给客户端之后，后台是不用存储，客户端访问时会验证其签名、过期时间等再取出里面的信息（如 username），再使用该信息直接查询用户信息完成登录验证。jwt 自带签名、过期等校验，后台不用存储，缺陷是一旦下发，服务后台无法拒绝携带该 jwt 的请求（如踢除用户），属于 no session 系统。

token+redis：自己生成 <key,value> 用户信息，访问时判断 redis 里是否有该 token，如果有，则加载该用户信息完成登录。服务需要存储下发的每个 token 及对应的 value，维持其过期时间，好处是随时可以删除某个 token，阻断该 token 继续使用，不属于 no session 系统。
