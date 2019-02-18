function numFormat(num) {
  return num.toString().replace(/\d+/, function(n) {
    // 先提取整数部分
    return n.replace(/(\d)(?=(\d{3})+$)/g, function($1) {
      // 对整数部分添加分隔符
      return $1 + ','
    })
  })
}
