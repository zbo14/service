'use strict'

const expect = require('chai').expect
const {describe, it} = require('mocha')
const service = require('../src/service')

const noop = () => {}

const handler = (emitter) => () => (cb) => {
  cb()
}

const start = (emitter) => (cb) => {
  emitter.emit('register')
  cb()
}

const stop = (emitter) => (cb) => {
  emitter.emit('unregister')
  cb()
}

const emitter = service({
  'handlers': {
    'event': handler  
  },
  'start': start,
  'stop': stop
})

describe('service', () => {
  
  it('starts service', (done) => {
    emitter.emit('start', done)
  })

  it('tests event handler', (done) => {
    emitter.emit('event', done)
  })

  it('stops service', (done) => {
    emitter.emit('stop', done)
  })

  it('starts service again', (done) => {
    emitter.emit('start', done)
  })

  it('tests event handler again', (done) => {
    emitter.emit('event', done)
  })

  it('stops service again', (done) => {
    emitter.emit('stop', done)
  })

  it('tries to start service multiple times', (done) => {
    emitter.once('error', (err) => {
      expect(err).to.be.an('error')
      emitter.emit('stop', done)
    })
    emitter.emit('start', noop)
    emitter.emit('start', noop)
  })

  it('tries to stop service before starting', (done) => {
    emitter.once('error', (err) => {
      expect(err).to.be.an('error')
      done()
    })
    emitter.emit('stop', noop)
  })

  it('starts service than tries to stop service multiple times', (done) => {
    emitter.once('error', (err) => {
      expect(err).to.be.an('error')
      done()
    })
    emitter.emit('start', noop)
    emitter.emit('stop', noop)
    emitter.emit('stop', noop)
  })
})