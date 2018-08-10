const EventEmitter = require('events')
const Queue = require('promise-queue')

class QueueEventEmitter {
  constructor(options = {}) {
    const concurrency = options.concurrency || 1
    this.emitter = new EventEmitter()
    this.queue = new Queue(concurrency)
    this.listeners = {}
  }

  saveWrapper(event, listener, wrapped) {
    let listeners = this.listeners[event]
    if (!listeners) {
      this.listeners[event] = { [listener]: wrapped }
    } else {
      listeners[listener] = wrapped
    }
  }

  removeWrapper(event, listener) {
    const listeners = this.listeners[event]
    if (listeners) {
      const wrapped = listeners[listener]
      delete listeners[listener]
      return wrapped
    }
  }

  wrap(event, listener) {
    const wrapped = (data) => {
      return this.queue.add(() => listener(data))
    }
    this.saveWrapper(event, listener, wrapped)
    return wrapped
  }

  wrapOnce(event, listener) {
    const wrapped = (data) => {
      this.removeWrapper(event, listener)
      return this.queue.add(() => listener(data))
    }
    this.saveWrapper(event, listener, wrapped)
    return wrapped
  }

  unwrap(event, listener) {
    return this.removeWrapper(event, listener)
  }

  on(event, listener) {
    return this.emitter.on(event, this.wrap(event, listener))
  }

  once(event, listener) {
    return this.emitter.once(event, this.wrapOnce(event, listener))
  }

  off(event, listener) {
    return this.emitter.removeListener(event, this.unwrap(event, listener))
  }

  addListener(event, listener) {
    return this.on(event, listener)
  }

  prependListener(event, listener) {
    return this.emitter.prependListener(event, this.wrap(event, listener))
  }

  prependOnceListener(event, listener) {
    return this.emitter.prependOnceListener(event, this.wrapOnce(event, listener))
  }

  removeListener(event, listener) {
    return this.off(event, listener)
  }

  removeAllListeners() {
    this.listeners = {}
    return this.emitter.removeAllListeners()
  }

  emit(event, data) {
    return this.emitter.emit(event, data)
  }

  getMaxListeners() {
    return this.emitter.getMaxListeners()
  }

  setMaxListeners(number) {
    return this.emitter.setMaxListeners(number)
  }

  listenerCount(event) {
    return this.emitter.listenerCount(event)
  }

  listeners(event) {
    return this.emitter.listeners(event)
  }
  
  rawListeners(event) {
    return this.emitter.rawListeners(event)
  }

  isEmpty() {
    return (
      this.queue.getQueueLength() === 0 &&
      this.queue.getPendingLength() === 0
    )
  }
}

QueueEventEmitter.defaultMaxListeners = EventEmitter.defaultMaxListeners

module.exports = QueueEventEmitter
