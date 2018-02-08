'use strict'

const expect = require('chai').expect
const {describe, it} = require('mocha')
const client = require('../example/client')
const server = require('../example/server')

const s = server()
const c1 = client()
const c2 = client()
const addr = 'localhost'
const msg = 'hello wurld'
const badMsg = {'this': 'is a bad message'}
const port = 8889

const sentMessage = (done) => {
  s.once('broadcast', (m) => {
    expect(m).to.equal(msg)
    c1.once('recv', (m) => {
      expect(m).to.equal(msg)
      c2.once('recv', (m) => {
        expect(m).to.equal(msg)
        done()
      })
    })
  })
}

describe('chat', () => {

  it(`starts server`, () => {
    s.emit('start', port)
  })

  it('starts accepting connections', (done) => {
    s.once('accept', () => {
      done()
    })
    s.emit('accept')
  })

  it('starts client1', (done) => {
    s.once('new-conn', () => {
      done()
    })
    c1.emit('start', `ws://${addr}:${port}`)
  })

  it('starts client2', (done) => {
    s.once('new-conn', () => {
      done()
    })
    c2.emit('start', `ws://${addr}:${port}`)
  })

  it('sends message from client1', (done) => {
    sentMessage(done)
    c1.emit('send', msg)
  })

  it('sends message from client2', (done) => {
    sentMessage(done)
    c2.emit('send', msg)
  })

  it('sends bad message', (done) => {
    c1.once('error', (err) => {
      expect(err).to.be.an('error')
      done()
    })
    c1.emit('send', badMsg)
  })

  it('closes client1 and removes it from server', (done) => {
    s.once('remove-conn', () => {
      done()
    })
    c1.emit('close')
  })

  it('closes client2 and removes it from server', (done) => {
    s.once('remove-conn', () => {
      done()
    })
    c2.emit('close')
  })

  it('closes server', (done) => {
    s.once('stop', () => {
      done()
    })
    s.emit('close')
  })
})