# Note

## 001 弱类型、强类型、动态类型、静态类型

弱/强类型指的是语言类型系统的类型检查的严格程度，动态/静态类型指的是变量与类型的绑定方法。

- 弱类型：偏向于容忍隐式类型转换。
- 强类型：偏向于不容忍隐式类型转换。
- 动态类型：编译的时候不知道每一个变量的类型，因为类型错误而不能做的事情是运行时错误。
- 静态类型：编译的时候就知道每一个变量的类型，因为类型错误而不能做的事情是语法错误。

![弱类型、强类型、动态类型、静态类型](https://raw.githubusercontent.com/chanshiyucx/yoi/master/2019/note/语言类型.jpg)

## 002 解除 chrome 浏览器的跨域限制

```bash
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security
```
