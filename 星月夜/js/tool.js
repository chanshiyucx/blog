/**
 * @description 是否重复操作
 * @param {string} [name='default'] 操作标识符
 * @param {number} [time=300] 间隔时间
 * @returns
 */
const reData = {}
export const isRepeat = (name = 'default', time = 300) => {
  const i = new Date()
  const re = i - (isNaN(reData[name]) ? 0 : reData[name])
  reData[name] = i
  return re <= time
}

/**
 * @description 日期转 string  2018-10-10 00:00:00
 * @param {date} 待格式化日期
 * @returns
 */
export function formatDateTimeToString(date) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  let hour = date.getHours()
  hour = hour < 10 ? '0' + hour : hour
  let minute = date.getMinutes()
  minute = minute < 10 ? '0' + minute : minute
  let second = date.getSeconds()
  second = second < 10 ? '0' + second : second

  return `${y}-${m < 10 ? '0' + m : m}-${
    d < 10 ? '0' + d : d
  } ${hour}:${minute}:${second}`
}


