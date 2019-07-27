# SpringMVC 前后端传参协调

话接上次练手 JavaWeb 实现了第一个后端接口，在 Postman 上测试可正常食用。寻思搭建个后台方便测试，却意外发生而后端无法接收参数的问题，花了点时间找下问题根源所在。

## 问题复现

### 前端传参

前端接口请求使用的 HTTP 库是知名的 [axios](https://github.com/axios/axios)，之前工作中项目一直使用都能顺利工作，故将其从原来的项目中 CV 过来。

```javascript
import axios from 'axios'

const baseUrl = 'http://localhost:8088'

class HttpRequest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    return config
  }
  destroy(url) {
    delete this.queue[url]
  }
  interceptors(instance, url) {
    // 请求拦截
    instance.interceptors.request.use(
      config => {
        this.queue[url] = true
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )
    // 响应拦截
    instance.interceptors.response.use(
      res => {
        this.destroy(url)
        return res.data
      },
      error => {
        this.destroy(url)
        return Promise.reject(error)
      }
    )
  }
  request(options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}

const axios = new HttpRequest(baseUrl)
export default axios
```

在 vuex 中调用登录接口，使用 Post 方法传参：

```javascript
// 用户登录
async ['user/handleLogin'](context, { username, password }) {
  const res = await axios.request({
    method: 'POST',
    url: '/user/login.do',
    data: {
      username,
      password
    }
  })
  return res
}
```

### 后端接口

后端是正常的 SpringMVC 接收参数方式：

```java
// 用户登录
@RequestMapping(value = "login.do", method = RequestMethod.POST)
@ResponseBody
public ServerResponse<User> login(HttpSession session, String username, String password) {
    System.out.println("username: " + username + " password: " + password);
    ServerResponse<User> response = iUserService.login(username, password);
    if (response.isSuccess()) {
        session.setAttribute(Const.CURRENT_USER, response.getData());
    }
    return response;
}
```

项目成功运行后，访问登录接口却无法登录，查看后端日志发现参数用户名和密码并没有正确接收，值为 null，改用 Get 请求后可以正确调用，看来是前后端对 Post 方法传参和接参没有协调一致。

## 解决方案

### 方案一 前端修改

前端主流传参格式使用 json 格式，并设置请求头 `'Content-Type': 'application/json'`，查看 `Request Payload` 可查参数格式如下：

```javascript
{ "username": "shiyu", "password": "654321" }
```

后端无法接收参数原因很简单，因为 axios post 一个对象到后端的时候，是直接把 json 放到请求体中的，提交到后端的，而后端是怎么取参数的，是用的 `@RequestParam`，这种方式只能从请求的地址中取出参数，也就是只能从 `username=shiyu&password=654321` 这种字符串中解析出参数，而不能提取出请求体中的参数的。

在后端代码不变的情况下，可以修改前端传参方式，使用 `URLSearchParams` 传参并修改请求头 `'Content-Type': 'application/x-www-form-urlencoded'`，将 json 对象传参转换为字符串格式。

```javascript
// 用户登录
async ['user/handleLogin'](context, { username, password }) {
  const param = new URLSearchParams()
  param.append('username', username)
  param.append('password', password)
  const res = await axios.request({
    method: 'POST',
    url: '/user/login.do',
    data: param
  })
  return res
}
```

### 方案二 后端修改

如果觉得前端使用 `URLSearchParams` 传参不方便，毕竟 json 传参还是主流，可以修改后端代码，直接去请求体中取参数。通过 `@RequestBody` 注解，SpringMVC 可以把 json 中的数据绑定到 Map 中，这样就可以取出参数了。

```java
// 用户登录
@RequestMapping(value = "login.do", method = RequestMethod.POST)
@ResponseBody
public ServerResponse<User> login(HttpSession session, @RequestBody Map map) {
    String username = (String) map.get("username");
    String password = (String) map.get("password");
    System.out.println("username: " + username + " password: " + password);
    ServerResponse<User> response = iUserService.login(username, password);
    if (response.isSuccess()) {
        session.setAttribute(Const.CURRENT_USER, response.getData());
    }
    return response;
}
```

参考文章：  
[axios 发送 post 请求，springMVC 接收不到数据问题](https://www.jianshu.com/p/042632dec9fb)
