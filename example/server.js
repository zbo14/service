'use strict'

const http = require('http')
const {Server, OPEN} = require('ws')
const service = require('../src/index')

const accept = (emitter) => (server) => () => {
  server.on('connection', (conn) => {
    emitter.emit('new-conn', conn)
    conn.on('message', (msg) => {
      if (typeof msg === 'string' && msg) {
        emitter.emit('broadcast', msg)
      } else {
        const res = JSON.stringify(msg)
        const err = new Error('expected non-empty string, got ' + res)
        emitter.emit('error', err)
      }
    })
    conn.on('close', () => {
      emitter.emit('remove-conn', conn)
    })
  })
}

const broadcast = () => (server) => (msg) => {
  server.clients.forEach((client) => {
    if (client.readyState === OPEN) {
      client.send(msg)
    }
  })
}

const close = (emitter) => (server) => () => {
  server.close((err) => {
    if (err) {
      emitter.emit('error', err)
    }
    emitter.emit('stop')
  })
}

const newConn = () => () => () => {
  console.log('Accepted new conn')
}

const removeConn = () => (server) => (conn) => {
  server.clients.delete(conn)
}

const start = (emitter) => (port) => {
  const httpServer = http.createServer()
  const server = new Server({ 
    'server': httpServer 
  })
  httpServer.listen(port, (err) => {
    if (err) {
      emitter.emit('error', err)
      emitter.emit('stop')
    } else {
      emitter.emit('register', server)
    }
  })
}

const stop = (emitter) => () => {
  emitter.emit('unregister')
}

const handlers = {
  'accept': accept,
  'broadcast': broadcast,
  'close': close,
  'new-conn': newConn,
  'remove-conn': removeConn
}

module.exports = () => {
  return service(handlers, start, stop)
}