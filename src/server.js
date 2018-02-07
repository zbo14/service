'use strict'

const http = require('http')
const {Server, OPEN} = require('ws')
const service = require('./service')

const accept = (emitter) => (server) => () => {
  server.on('connection', (conn) => {
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
      emitter.emit('remove', conn)
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

const remove = () => (server) => (conn) => {
  server.clients.delete(conn)
}

const start = (emitter) => (port) => {
  const httpServer = http.createServer((req, res) => {
    res.writeHead(404)
    res.end()
  })
  const server = new Server({ 
    'server': httpServer 
  })
  httpServer.listen(port, (err) => {
    if (err) {
      emitter.emit('error', err)
      emitter.emit('stop')
    } else {
      return emitter.emit('register', server)
    }
  })
}

const stop = (emitter) => () => {
  emitter.emit('unregister')
}

module.exports = () => {
  return service({
    'name': 'server',
    'handlers': {
      'accept': accept,
      'broadcast': broadcast,
      'close': close,
      'remove': remove
    },
    'start': start,
    'stop': stop
  })
}