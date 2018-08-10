# queue-event-emitter

[![npm version](https://img.shields.io/npm/v/queue-event-emitter.svg?style=flat-square)](https://www.npmjs.com/package/queue-event-emitter)
[![build status](https://img.shields.io/travis/itsmepetrov/queue-event-emitter/master.svg?style=flat-square)](https://travis-ci.org/itsmepetrov/queue-event-emitter)

`QueueEventEmitter` is a simple `EventEmitter` which runs every event in a queue.

## Installation

```bash
npm i --save queue-event-emitter
```

## Usage

```js
const QueueEventEmitter = require('queue-event-emitter')

// helper function
const sleep = (time) => (
  new Promise((resolve) => setTimeout(resolve, time))
)

// event emitter
const emitter = new QueueEventEmitter()

// event handlers
emitter.on('first', async (data) => {
    await sleep(3000)
    console.log('data:', data)
})
emitter.on('second', async (data) => {
    await sleep(1000)
    console.log('data:', data)
})

// send events
emitter.emit('first', 10)
emitter.emit('second', 20)

// result in console will be
// data: 10
// data: 20
```

## API

Implements the same api as node's [EventEmitter](https://nodejs.org/api/events.html).

## Options

`QueueEventEmitter` class accepts following options:
 - `options.concurrency` `<number>` The maximum number of events to execute at once. (__Default:__ 1)

## Licence

Licensed under [MIT](LICENSE)