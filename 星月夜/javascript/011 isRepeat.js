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
