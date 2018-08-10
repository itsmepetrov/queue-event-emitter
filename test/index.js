const chai = require('chai')
const EventEmitter = require('events')
const QueueEventEmitter = require('..')

describe('queue-event-emitter', function () {
  const expect = chai.expect
  const sleep = (time) => (
    new Promise(resolve => setTimeout(resolve, time))
  )
  const wait = (emitter) => {
    const next = (resolve) => {
      if (emitter.isEmpty()) {
        resolve()
      } else {
        sleep(100).then(() => next(resolve))
      }
    }
    return new Promise(next)
  }

  describe('QueueEventEmitter', function () {
    it('defaultMaxListeners', function () {
      expect(
        QueueEventEmitter.defaultMaxListeners
      ).to.equal(
        EventEmitter.defaultMaxListeners
      )
    })
  })

  describe('emitter', function () {
    it('isEmpty', async function () {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (time) => () => sleep(100)

      emitter.on('try', handler(100))

      emitter.emit('try')
      expect(emitter.isEmpty()).to.be.false
      emitter.emit('try')
      expect(emitter.isEmpty()).to.be.false
      emitter.emit('try')
      expect(emitter.isEmpty()).to.be.false

      await sleep(400)

      expect(emitter.isEmpty()).to.be.true
    })

    it('on', async function () {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (time) => (data) => (
        sleep(time).then(() => result.push(data))
      )

      emitter.on('first', handler(300))
      emitter.on('second', handler(100))

      emitter.emit('first', 3)
      emitter.emit('second', 1)
      emitter.emit('first', 2)
      emitter.emit('first', 4)
      emitter.emit('second', 5)

      await wait(emitter)

      expect(result).to.eql([3, 1, 2, 4, 5])
    })

    it('addListener', async function () {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (time) => (data) => (
        sleep(time).then(() => result.push(data))
      )

      emitter.addListener('first', handler(300))
      emitter.addListener('second', handler(100))

      emitter.emit('first', 3)
      emitter.emit('second', 1)
      emitter.emit('first', 2)
      emitter.emit('first', 4)
      emitter.emit('second', 5)

      await wait(emitter)

      expect(result).to.eql([3, 1, 2, 4, 5])
    })

    it('prependListener', async function () {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (time, number) => () => (
        sleep(time).then(() => result.push(number))
      )

      emitter.prependListener('prepend', handler(300, 1))
      emitter.prependListener('prepend', handler(100, 2))

      emitter.emit('prepend', null)

      await wait(emitter)

      expect(result).to.eql([2, 1])
    })

    it('once', async function () {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (data) => (
        sleep(100).then(() => result.push(data))
      )

      emitter.once('onlyonce', handler)
      emitter.emit('onlyonce', 1)
      emitter.emit('onlyonce', 2)

      await wait(emitter)

      expect(result).to.eql([1])
    })

    it('prependOnceListener', async function () {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (time, number) => () => (
        sleep(time).then(() => result.push(number))
      )

      emitter.prependOnceListener('prepend', handler(300, 1))
      emitter.prependOnceListener('prepend', handler(100, 2))

      emitter.emit('prepend', null)
      emitter.emit('prepend', null)

      await wait(emitter)

      expect(result).to.eql([2, 1])
    })

    it('off', async function () {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (data) => (
        sleep(100).then(() => result.push(data))
      )

      emitter.on('remove', handler)
      emitter.emit('remove', 1)
      emitter.off('remove', handler)
      emitter.emit('remove', 2)

      await wait(emitter)

      expect(result).to.eql([1])
    })

    it('removeListener', async function () {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (data) => (
        sleep(100).then(() => result.push(data))
      )

      emitter.on('remove', handler)
      emitter.emit('remove', 1)
      emitter.removeListener('remove', handler)
      emitter.emit('remove', 2)

      await wait(emitter)

      expect(result).to.eql([1])
    })

    it('removeAllListeners', async function () {
      const emitter = new QueueEventEmitter()
      const result = []
      const handler = (data) => (
        sleep(100).then(() => result.push(data))
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
  })
})
