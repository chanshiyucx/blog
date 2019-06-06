
const isFun = fn => return (typeof fn === 'function')
// const isValidName = str => return false 

class EventBus {
  constructor() {
    this.handler = {}
  }

  listen(eventName, fn) {
    console.log('绑定事件', eventName)
  }
}

// const bus = new EventBus()

// bus.create('hello').listen('hi', () => {
//   console.log('2222')
// })
