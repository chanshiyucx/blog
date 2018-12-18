正则表达式一直是我的弱项，工作项目中表单验证又或者平时写写爬虫都是棘手万分，工作中避之不及却又无法割舍，不懂正则真是枉为程序员（羞愧脸），这次找个时间好好补补课。<!-- more -->

## 字符匹配

**正则是匹配模式，要么匹配字符，要么匹配位置**。

### 两种模糊匹配

除了精确匹配，正则还能实现模糊匹配，模糊匹配又分为横向模糊和纵向模糊。

#### 横向模糊匹配

横向模糊指的是，一个正则可匹配的字符串的长度不是固定的。其实现方式是使用量词，譬如 {m, n}，表示连续出现最少 m 次，最多 n 次。

```javascript
const regex = /ab{2,4}c/g
const string = 'abc abbc abbbc abbbbc abbbbbc'
console.log(string.match(regex)) // ["abbc", "abbbc", "abbbbc"]
```

正则 g 修饰符表示全局匹配，强调“所有”而不是“第一个”。

```javascript
// 无全局修饰符的情况
const regex = /ab{2,4}c/
const string = 'abc abbc abbbc abbbbc abbbbbc'
console.log(string.match(regex))
// ["abbc", index: 4, input: "abc abbc abbbc abbbbc abbbbbc", groups: undefined]
```

#### 纵向模糊匹配

纵向模糊指的是，一个正则匹配的字符串，具体到某一位字符时，它可以不是某个确定的字符。其实现方式是使用字符组，譬如 [abc]，表示该字符是可以字符 "a"、"b"、"c" 中的任何一个。

```javascript
const regex = /a[123]b/g
const string = 'a0b a1b a2b a3b a4b'
console.log(string.match(regex)) // ["a1b", "a2b", "a3b"]
```

### 字符组

虽然称为字符组，但匹配的其实只是一个字符。譬如字符组 [abc] 只是匹配一个字符。字符组有范围表示法、排除法和简写形式。

#### 范围表示法

字符组 [0-9a-zA-Z] 表示数字、大小写字母中任意一个字符。

由于连字符"-"有特殊含义，所以要匹配 "a"、"-"、"c" 中的任何一个字符，可以写成如下形式：[-az]、[az-]、[a\-z]，连字符要么开头，要么结尾，要么转义。

#### 

## 位置匹配

## 括号的作用

## 回溯法原理

## 正则的拆分

## 正则的构建

## 正则编程
