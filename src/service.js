'use strict'

const EventEmitter = require('events')

module.exports = ({ handlers, start, stop }) => {

  const emitter = new EventEmitter()

  emitter.on('error', (err) => {
    setImmediate(() => {
      console.error(`Error in service: ${err.message}.`)
    })
  })

  const events = Object.keys(handlers)
  let running = false
  start = start(emitter)
  stop = stop(emitter)

  events.forEach((event) => {
    handlers[event] = handlers[event](emitter)
  })

  emitter.on('start', (...args) => {
    setImmediate(() => {
      if (running) {
        const err = new Error(`service is already running`)
        emitter.emit('error', err)
      } else {
        start(...args)
        running = true
      }
    })
  })

  emitter.on('register', (...args) => {
    setImmediate(() => {
      events.forEach((event) => {
        const handler = handlers[event](...args)
        emitter.on(event, (...args) => {
          setImmediate(() => {
            handler(...args)
          })
        })
      })
    })
  })

  emitter.on('stop', (...args) => {
    setImmediate(() => {
      if (running) {
        stop(...args)
        running = false
      } else {
        const err = new Error(`service is not running`)
        emitter.emit('error', err)
      }
    })
  })

  emitter.on('unregister', () => {
    setImmediate(() => {
      events.forEach((event) => {
        emitter.removeAllListeners(event)
      })
    })
  })

  emitter.on('ping', () => {
    setImmediate(() => {
      if (running) {
        emitter.emit('pong')
      }
    })
  })

  return emitter
}