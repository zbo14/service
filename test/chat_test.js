'use strict'

const expect = require('chai').expect
const {describe, it} = require('mocha')
const client = require('../src/client')
const server = require('../src/server')

const s = server()
const c1 = client()
const c2 = client()
const msg = 'hello wurld'
const addr = 'localhost'
const port = 8889

describe('chat', () => {

  it(`starts server`, () => {
    s.emit('start', port)
  })

  it('starts accepting connections', () => {
    s.emit('accept')
  })

  it('starts client1', () => {
    c1.emit('start', `ws://${addr}:${port}`)
  })

  it('starts client2', () => {
    c2.emit('start', `ws://${addr}:${port}`)
  })

  it('sends message', () => {
    c1.emit('send', msg)
  })

  it('receives message for client1', () => {
    c1.once('recv', (m) => {
      expect(m).to.equal(msg)
      done()
    })
  })

  it('receives message for client2', () => {
    c2.once('recv', (m) => {
      expect(m).to.equal(msg)
      done()
    })
  })

  it('closes client1 and removes it from server', (done) => {
    s.once('remove', () => {
      done()
    })
    c1.emit('close')
  })

  it('closes client2 and removes it from server', (done) => {
    s.once('remove', () => {
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