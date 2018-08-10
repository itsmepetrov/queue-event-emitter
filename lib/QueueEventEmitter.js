const EventEmitter = require('events')
const Queue = require('promise-queue')

class QueueEventEmitter {
  constructor(options = {}) {
    const concurrency = options.concurrency || 1
    this._emitter = new EventEmitter()
    this._queue = new Queue(concurrency)
    this._listeners = {}
  }

  requestListeners(event) {
    let listeners = this._listeners[event]
    if (listeners) {
      return listeners
    } else {
      listeners = this._listeners[event] = []
      return listeners
    }
  }

  saveWrapper(event, listener, wrapper) {
    this.requestListeners(event).push({ listener, wrapper })
  }

  removeWrapper(event, listener) {
    const listeners = this.requestListeners(event)
    const iterator = (item) => item.listener === listener
    const index = listeners.findIndex(iterator)
    if (index > -1) {
      const handler = listeners[index]
      listeners.splice(index, 1)
      return handler.wrapper
    } else {
      return listener
    }
  }

  wrap(event, listener) {
    const wrapper = (data) => {
      return this._queue.add(() => listener(data))
    }
    this.saveWrapper(event, listener, wrapper)
    return wrapper
  }

  wrapOnce(event, listener) {
    const wrapper = (data) => {
      this.removeWrapper(event, listener)
      return this._queue.add(() => listener(data))
    }
    this.saveWrapper(event, listener, wrapper)
    return wrapper
  }

  unwrap(event, listener) {
    return this.removeWrapper(event, listener)
  }

  on(event, listener) {
    return this._emitter.on(event, this.wrap(event, listener))
  }

  once(event, listener) {
    return this._emitter.once(event, this.wrapOnce(event, listener))
  }

  off(event, listener) {
    return this._emitter.removeListener(event, this.unwrap(event, listener))
  }

  addListener(event, listener) {
    return this.on(event, listener)
  }

  prependListener(event, listener) {
    return this._emitter.prependListener(event, this.wrap(event, listener))
  }

  prependOnceListener(event, listener) {
    return this._emitter.prependOnceListener(event, this.wrapOnce(event, listener))
  }

  removeListener(event, listener) {
    return this.off(event, listener)
  }

  removeAllListeners() {
    this._listeners = {}
    return this._emitter.removeAllListeners()
  }

  emit(event, data) {
    return this._emitter.emit(event, data)
  }

  getMaxListeners() {
    return this._emitter.getMaxListeners()
  }

  setMaxListeners(number) {
    return this._emitter.setMaxListeners(number)
  }

  listenerCount(event) {
    return this._emitter.listenerCount(event)
  }

  listeners(event) {
    return this.requestListeners(event).map(item => item.listener)
  }
  
  rawListeners(event) {
    return this._emitter.rawListeners(event)
  }

  isEmpty() {
    return (
      this._queue.getQueueLength() === 0 &&
      this._queue.getPendingLength() === 0
    )
  }
}

QueueEventEmitter.defaultMaxListeners = EventEmitter.defaultMaxListeners
QueueEventEmitter.listenerCount = EventEmitter.listenerCount

module.exports = QueueEventEmitter
