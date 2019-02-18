/*
 * sort 方法
 */
const shuffle1 = arr => {
  arr.sort(() => Math.random() > 0.5)
  return arr
}

/*
 * Fisher–Yates Shuffle 洗牌算法
 * https://bost.ocks.org/mike/shuffle/
 */
const shuffle2 = arr => {
  let i = arr.length,
    j
  while (i) {
    j = Math.floor(Math.random() * i--)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
