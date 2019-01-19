// 天数加减,m返回当天的日期
export function computeDay(dates = 0) {
  let t = new Date()
  t.setDate(t.getDate() + dates)
  let y = t.getFullYear()
  let m = t.getMonth() + 1
  let d = t.getDate()
  return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`
}

// 获取本周的时间
export function getCurrentWeek() {
  let d = new Date()
  let day = d.getDay()
  let c = 7 - day
  return [computeDay(c - 6), computeDay(c)]
}

// 获取上周的时间
export function getLastWeek() {
  let d = new Date()
  let day = d.getDay()
  let c = 7 - day
  return [computeDay(c - 13), computeDay(c - 7)]
}

// 月份加减,返回第一天和最后一天日期
export function computeMonth(months = 0) {
  let t = new Date()
  if (months) {
    t.setMonth(t.getMonth() + months)
  }
  let y = t.getFullYear()
  let m = t.getMonth() + 1
  let d = 0
  if (~[1, 3, 5, 7, 8, 10, 12].indexOf(m)) {
    d = 31
  } else if (m == 2) {
    // 判断是否为闰年（能被4整除且不能被100整除 或 能被100整除且能被400整除）
    if ((y % 4 == 0 && y % 100 != 0) || (y % 100 == 0 && y % 400 == 0)) {
      d = 29
    } else {
      d = 28
    }
  } else {
    d = 30
  }
  return [
    `${y}-${m < 10 ? '0' + m : m}-${1}`,
    `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`
  ]
}

// 获取本月的时间
export function getCurrentMonth() {
  return computeMonth()
}

// 获取上月的时间
export function getLastMonth() {
  return computeMonth(-1)
}
