# JavaScript 正则匹配方法探究

在 JavaScript 中常用正则匹配方法有 `match` 和 `exec`, 这两个方法属于不同的对象方法。

- `match` 是字符串方法，写法为：`str.match(regex)`
- `exec` 是正则表达式方法，写法为：`regex.exec(str)`

两者在匹配成功时返回的都是数组，在没有匹配上时返回的都是 null，在一些情况下两者返回的结果相同，故在没有深入了解两者的使用规则前，会误以为两者的使用效果是一样的，容易造成误用。在有**全局匹配**和**分组**的情况下，两个有很大差异。

## 全局匹配

当不使用全局匹配时，两者的匹配效果是一样的，仅返回第一次匹配成功的结果：

```js
const str = 'aaa bbb ccc'
const regex = /\b\w+\b/
console.log('match:', str.match(regex))
console.log('exec:', regex.exec(str))

// match: [ 'aaa', index: 0, input: 'aaa bbb ccc', groups: undefined ]
// exec: [ 'aaa', index: 0, input: 'aaa bbb ccc', groups: undefined ]
```

当使用全局匹配时，两者的匹配结果出现区别：

```js
const str = 'aaa bbb ccc'
const regex = /\b\w+\b/g
console.log('match1:', str.match(regex))
console.log('match2:', str.match(regex))
console.log('match3:', str.match(regex))
console.log('exec1:', regex.exec(str))
console.log('exec2:', regex.exec(str))
console.log('exec3:', regex.exec(str))

// match1: [ 'aaa', 'bbb', 'ccc' ]
// match2: [ 'aaa', 'bbb', 'ccc' ]
// match3: [ 'aaa', 'bbb', 'ccc' ]
// exec1: [ 'aaa', index: 0, input: 'aaa bbb ccc', groups: undefined ]
// exec2: [ 'bbb', index: 4, input: 'aaa bbb ccc', groups: undefined ]
// exec3: [ 'ccc', index: 8, input: 'aaa bbb ccc', groups: undefined ]
```

总结：

- 无全局匹配时，match 和 exec 效果一样，仅返回第一次匹配成功的结果；
- 全局匹配时，match 会返回所有匹配上的内容；而 exec 仅匹配单次匹配上的内容，当多次匹配时，exec 会从上次匹配结束的下一位开始匹配，返回本次匹配上的内容，直至无可以匹配的内容，返回 null。

## 分组

无全局匹配且分组时，match 和 exec 返回结果相同，此时由于表达式采用了括号分组，所以在返回匹配结果的同时，依次返回该结果的所有分组：

```js
const str = 'aaa1 bbb2 ccc3'
const regex = /\b(\w+)(\d+)\b/
console.log('match1:', str.match(regex))
console.log('match2:', str.match(regex))
console.log('match3:', str.match(regex))
console.log('exec1:', regex.exec(str))
console.log('exec2:', regex.exec(str))
console.log('exec3:', regex.exec(str))

// match1: ["aaa1", "aaa", "1", index: 0, input: "aaa1 bbb2 ccc3", groups: undefined]
// match2: ["aaa1", "aaa", "1", index: 0, input: "aaa1 bbb2 ccc3", groups: undefined]
// match3: ["aaa1", "aaa", "1", index: 0, input: "aaa1 bbb2 ccc3", groups: undefined]
// exec1: ["aaa1", "aaa", "1", index: 0, input: "aaa1 bbb2 ccc3", groups: undefined]
// exec2: ["aaa1", "aaa", "1", index: 0, input: "aaa1 bbb2 ccc3", groups: undefined]
// exec3: ["aaa1", "aaa", "1", index: 0, input: "aaa1 bbb2 ccc3", groups: undefined]
```

全局匹配且分组时，match 和 exec 返回结果不同。match 会返回所有匹配到的结果，而 exec 会返回本次匹配到的结果，若表达式中出现分组，则会依次返回本次匹配的全部分组：

```js
const str = 'aaa1 bbb2 ccc3'
const regex = /\b(\w+)(\d+)\b/g
console.log('match1:', str.match(regex))
console.log('match2:', str.match(regex))
console.log('match3:', str.match(regex))
console.log('exec1:', regex.exec(str))
console.log('exec2:', regex.exec(str))
console.log('exec3:', regex.exec(str))

// match1: ["aaa1", "bbb2", "ccc3"]
// match2: ["aaa1", "bbb2", "ccc3"]
// match3: ["aaa1", "bbb2", "ccc3"]
// exec1: ["aaa1", "aaa", "1", index: 0, input: "aaa1 bbb2 ccc3", groups: undefined]
// exec2: ["bbb2", "bbb", "2", index: 5, input: "aaa1 bbb2 ccc3", groups: undefined]
// exec3: ["ccc3", "ccc", "3", index: 10, input: "aaa1 bbb2 ccc3", groups: undefined]
```

## 实战

```js
// 匹配十六进制颜色值
const regex = /#([0-9a-zA-Z]{6}|[0-9a-zA-Z]{3})/g
const str = `#ffbbad #Fc01DF #FFF #ffE`
let m

while ((m = regex.exec(str)) !== null) {
  // This is necessary to avoid infinite loops with zero-width matches
  if (m.index === regex.lastIndex) {
    regex.lastIndex++
  }

  // The result can be accessed through the `m`-variable.
  m.forEach((match, groupIndex) => {
    console.log(`Found match, group ${groupIndex}: ${match}`)
  })
}

// Found match, group 0: #ffbbad
// Found match, group 1: ffbbad
// Found match, group 0: #Fc01DF
// Found match, group 1: Fc01DF
// Found match, group 0: #FFF
// Found match, group 1: FFF
// Found match, group 0: #ffE
// Found match, group 1: ffE
```
