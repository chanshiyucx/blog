const genId = (() => {
  let count = 0
  return () => {
    return ++count
  }
})()

console.log(genId())
console.log(genId())
console.log(genId())
console.log(genId())
console.log(genId())
