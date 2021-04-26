// var regex = /ab{2,5}c/g
// var string = 'abc abbc abbbc abbbbc abbbbbc abbbbbbc'
// console.log(string.match(regex))

// var regex = /a[123]b/g;
// var string = "a0b a1b a2b a3b a4b";
// console.log( string.match(regex) );

// var regex = /good|goodbye/g;
// var string = "goodbye";
// console.log( string.match(regex) );

// var regex = /goodbye|good/g;
// var string = "goodbye";
// console.log( string.match(regex) );

// var regex = /#[0-9a-zA-Z]{3}([0-9a-zA-Z]{3})?/g

// var regex = /#([0-9a-zA-Z]{6}|[0-9a-zA-Z]{3})/g

// const regex = /#([0-9a-zA-Z]{6}|[0-9a-zA-Z]{3})/g
// const str = `#ffbbad #Fc01DF #FFF #ffE`
// let m

// while ((m = regex.exec(str)) !== null) {
//   // This is necessary to avoid infinite loops with zero-width matches
//   if (m.index === regex.lastIndex) {
//     regex.lastIndex++
//   }

//   // The result can be accessed through the `m`-variable.
//   m.forEach((match, groupIndex) => {
//     console.log(`Found match, group ${groupIndex}: ${match}`)
//   })
// }

// const str = 'aaa1 bbb2 ccc3'
// const regex = /\b(\w+)(\d+)\b/g
// console.log('match1:', str.match(regex))
// console.log('match2:', str.match(regex))
// console.log('match3:', str.match(regex))
// console.log('exec1:', regex.exec(str))
// console.log('exec2:', regex.exec(str))
// console.log('exec3:', regex.exec(str))

// const str = ''
// const regex = /([01][0-9]|2[0-3]):[0-5][0-9]/

// const str = '<div id="container" class="main"></div>'
// const regex = /\bid="\w*?"\b/

/**
 * @param {string} s
 * @return {number}
 */
var numDecodings = function (s) {
  // 以 0 开头则返回 0
  if (s.startsWith('0')) return 0

  // 将字符串分割成数组
  const arr = s.split('')

  // 映射表数字为 1-26，其实就是找出多少个以 1、2 开始且后跟数为
  // 假设 1 和 2 数目为 n，就是可以组成 2 ^ n 种结果
  // 又因为 0 不能映射，n 又要减去 0 的个数
  const n = arr.filter((o) => o === '1' || o === '2').length
  const m = arr.filter((o) => o === '0').length
  const result = 2 ** (n - m)

  console.log('n:' + n + ' m:' + m + '  result:' + result)

  return result
}

const s = '226'
numDecodings(s)

// console.log('12345'.split(''))
