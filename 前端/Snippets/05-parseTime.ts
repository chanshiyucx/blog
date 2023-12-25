/**
 * @description 日期格式化
 * @param {Date} time 待格式化日期
 * @param {string} format 转换格式
 * @return {string} 格式化后日期字符串
 */
const parseTime = (
  time: Date | string | number,
  format: string = "{y}-{m}-{d} {h}:{i}:{s}"
): string => {
  let date: Date
  if (typeof time === "object") {
    date = time
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value]
    }
    if (result.length > 0 && value < 10) {
      value = "0" + value
    }
    return value || 0
  })
  return time_str
}

// 测试用例
console.log(parseTime(new Date())) // 2023-12-21 15:21:36
console.log(parseTime("2012-12-10")) // 2012-12-10 08:00:00


