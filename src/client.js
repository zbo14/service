'use strict'

const WebSocket = require('ws')
const service = require('./service')

const close = () => (ws) => () => {
  ws.close()
}

const recv = () => () => (msg) => {
  console.log('Received message: ' + msg)
}

const send = (emitter) => (ws) => (msg) => {
  if (typeof msg === 'string' && msg) {
    ws.send(msg)
  } else {
    const result = JSON.stringify(msg)
    const err = new Error('expected non-empty string, got ' + result)
    emitter.emit('error', err)
  }
}

const start = (emitter) => (host) => {
  const ws = new WebSocket(host, {
    'perMessageDeflate': false
  })
  ws.on('open', () => {
    emitter.emit('register', ws)
  })
  ws.on('close', () => {
    emitter.emit('stop')
  })
  ws.on('message', (msg) => {
    emitter.emit('recv', msg)
  })
}

const stop = (emitter) => () => {
  emitter.emit('unregister')
}

module.exports = () => {
  return service({
    'name': 'client', 
    'handlers': {
      'close': close,
      'recv': recv, 
      'send': send
    }, 
    'start': start,
    'stop': stop
  })
}
