/**
 * @description 洗牌算法实现数组乱序 https://bost.ocks.org/mike/shuffle/
 * @param  {T[]} arr 待乱序的数组
 * @return {T[]} 被乱序后的数组
 */
const shuffle = <T>(arr: T[]): T[] => {
  let i = arr.length
  let j: number
  while (i) {
    j = Math.floor(Math.random() * i--)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 测试用例
console.log(shuffle([1, 2, 3, 4, 5, 6]))
