const chai = require('chai')
const EventEmitter = require('events')
const QueueEventEmitter = require('..')

describe('queue-event-emitter', () => {
  const { expect } = chai
  const sleep = time => (
    new Promise(resolve => setTimeout(resolve, time))
  )
  const wait = (emitter) => {
    const next = (resolve) => {
      if (emitter.isEmpty()) {
        resolve()
      } else {
        sleep(10).then(() => next(resolve))
      }
    }
    return new Promise(next)
  }

  describe('QueueEventEmitter', () => {
    it('defaultMaxListeners', () => {
      expect(
        QueueEventEmitter.defaultMaxListeners
      ).to.equal(
        EventEmitter.defaultMaxListeners
      )
    })
    it('listenerCount', () => {
      const emitter = new QueueEventEmitter()
      const handler = () => {}

      emitter.on('count', handler)
      emitter.on('count', handler)
      emitter.on('count', handler)

      expect(
        QueueEventEmitter.listenerCount(emitter, 'none')
      ).to.equal(0)
      expect(
        QueueEventEmitter.listenerCount(emitter, 'count')
      ).to.equal(3)
    })
  })

  describe('emitter', () => {
    it('isEmpty', async () => {
      const emitter = new QueueEventEmitter()
      const handler = () => sleep(10)

      emitter.on('try', handler)

      emitter.emit('try')
      expect(emitter.isEmpty()).to.equal(false)
      emitter.emit('try')
      expect(emitter.isEmpty()).to.equal(false)
      emitter.emit('try')
      expect(emitter.isEmpty()).to.equal(false)

      await sleep(40)

      expect(emitter.isEmpty()).to.equal(true)
    })

    it('on', async () => {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = time => data => (
        sleep(time).then(() => result.push(data))
      )

      emitter.on('first', handler(30))
      emitter.on('second', handler(10))

      emitter.emit('first', 3)
      emitter.emit('second', 1)

      await wait(emitter)

      expect(result).to.eql([3, 1])
    })

    it('addListener', async () => {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = time => data => (
        sleep(time).then(() => result.push(data))
      )

      emitter.addListener('first', handler(30))
      emitter.addListener('second', handler(10))

      emitter.emit('first', 3)
      emitter.emit('second', 1)

      await wait(emitter)

      expect(result).to.eql([3, 1])
    })

    it('prependListener', async () => {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (time, number) => () => (
        sleep(time).then(() => result.push(number))
      )

      emitter.prependListener('prepend', handler(30, 1))
      emitter.prependListener('prepend', handler(10, 2))

      emitter.emit('prepend', null)

      await wait(emitter)

      expect(result).to.eql([2, 1])
    })

    it('once', async () => {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = data => (
        sleep(10).then(() => result.push(data))
      )

      emitter.once('onlyonce', handler)
      emitter.emit('onlyonce', 1)
      emitter.emit('onlyonce', 2)

      await wait(emitter)

      expect(result).to.eql([1])
    })

    it('prependOnceListener', async () => {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (time, number) => () => (
        sleep(time).then(() => result.push(number))
      )

      emitter.prependOnceListener('prepend', handler(30, 1))
      emitter.prependOnceListener('prepend', handler(10, 2))

      emitter.emit('prepend', null)
      emitter.emit('prepend', null)

      await wait(emitter)

      expect(result).to.eql([2, 1])
    })

    it('off', async () => {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = data => (
        sleep(10).then(() => result.push(data))
      )

      emitter.on('remove', handler)
      emitter.emit('remove', 1)
      emitter.off('remove', handler)
      emitter.emit('remove', 2)

      await wait(emitter)

      expect(result).to.eql([1])
    })

    it('removeListener', async () => {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = data => (
        sleep(10).then(() => result.push(data))
      )

      emitter.on('remove', handler)
      emitter.emit('remove', 1)
      emitter.removeListener('remove', handler)
      emitter.emit('remove', 2)

      await wait(emitter)

      expect(result).to.eql([1])
    })

    it('removeAllListeners', async () => {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = data => (
        sleep(10).then(() => result.push(data))
      )

      emitter.on('one', handler)
      emitter.on('two', handler)
      emitter.on('three', handler)
      emitter.removeAllListeners('remove', handler)
      emitter.emit('one', 1)
      emitter.emit('two', 2)
      emitter.emit('three', 3)

      await wait(emitter)

      expect(result).to.eql([])
    })

    it('getMaxListeners', async () => {
      const emitter = new QueueEventEmitter()
      const nodeEmitter = new EventEmitter()

      expect(
        emitter.getMaxListeners()
      ).to.equal(
        nodeEmitter.getMaxListeners()
      )
    })

    it('setMaxListeners', async () => {
      const emitter = new QueueEventEmitter()
      const result = emitter.getMaxListeners() + 1

      emitter.setMaxListeners(result)

      expect(emitter.getMaxListeners()).to.equal(result)
    })

    it('listenerCount', async () => {
      const emitter = new QueueEventEmitter()
      const handler = () => {}

      emitter.on('one', handler)
      emitter.on('two', handler)
      emitter.on('two', handler)
      emitter.on('three', handler)
      emitter.on('three', handler)
      emitter.on('three', handler)

      expect(emitter.listenerCount('one')).to.equal(1)
      expect(emitter.listenerCount('two')).to.equal(2)
      expect(emitter.listenerCount('three')).to.equal(3)
    })

    it('listeners', async () => {
      const emitter = new QueueEventEmitter()
      const firstHandler = () => {}
      const secondHandler = () => {}
      const thirdHandler = () => {}

      emitter.on('first', firstHandler)
      emitter.on('second', secondHandler)
      emitter.on('second', secondHandler)
      emitter.on('third', thirdHandler)
      emitter.on('third', thirdHandler)
      emitter.on('third', thirdHandler)

      expect(emitter.listeners('first')).to.eql([firstHandler])
      expect(emitter.listeners('second')).to.eql([secondHandler, secondHandler])
      expect(emitter.listeners('third')).to.eql([thirdHandler, thirdHandler, thirdHandler])
    })
  })

  describe('options', () => {
    it('concurrency: 1', async () => {
      const emitter = new QueueEventEmitter({ concurrency: 1 })
      const result = []
      const handler = time => data => (
        sleep(time).then(() => result.push(data))
      )

      emitter.on('first', handler(30))
      emitter.on('second', handler(10))

      emitter.emit('first', 3)
      emitter.emit('second', 1)
      emitter.emit('first', 2)
      emitter.emit('first', 4)
      emitter.emit('second', 5)

      await wait(emitter)

      expect(result).to.eql([3, 1, 2, 4, 5])
    })

    it('concurrency: 2', async () => {
      const emitter = new QueueEventEmitter({ concurrency: 2 })
      const result = []
      const handler = time => data => (
        sleep(time).then(() => result.push(data))
      )

      emitter.on('first', handler(30))
      emitter.on('second', handler(10))

      emitter.emit('first', 3)
      emitter.emit('second', 1)
      emitter.emit('first', 2)
      emitter.emit('first', 4)
      emitter.emit('second', 5)

      await wait(emitter)

      expect(result).to.eql([1, 3, 2, 5, 4])
    })
  })
})
