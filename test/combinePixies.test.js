// @flow
import { combinePixies, reflectPixieOutput } from '../src/redux-pixies.js'
import { makeAssertLog } from './assertLog.js'
import { describe, it } from 'mocha'

describe('combinePixies', function () {
  it('basic operation', function () {
    const log = makeAssertLog()
    const onOutput = data => log('output ' + JSON.stringify(data))

    const testPixie1 = (onError, onOutput) => ({
      update (props: {}) {
        log('update 1 ' + JSON.stringify(props))
        onOutput(1)
      },
      destroy () {
        log('destroy 1')
      }
    })

    const testPixie2 = (onError, onOutput) => ({
      update (props: {}) {
        log('update 2 ' + JSON.stringify(props))
        onOutput(2)
      },
      destroy () {
        log('destroy 2')
      }
    })

    const instance = combinePixies({
      testPixie1,
      testPixie2
    })(() => {}, onOutput)
    instance.update({ x: 2 })
    instance.destroy()
    log.assert([
      'output {}',
      'update 1 {"x":2}',
      'output {"testPixie1":1}',
      'update 2 {"x":2}',
      'output {"testPixie1":1,"testPixie2":2}',
      'destroy 1',
      'destroy 2'
    ])
  })

  it('with reflection', function () {
    const log = makeAssertLog()
    const onOutput = data => log('output ' + JSON.stringify(data))

    const testPixie1 = (onError, onOutput) => ({
      update (props: {}) {
        log('update 1 ' + JSON.stringify(props))
        onOutput(1)
      },
      destroy () {
        log('destroy 1')
      }
    })

    const testPixie2 = (onError, onOutput) => ({
      update (props: {}) {
        log('update 2 ' + JSON.stringify(props))
        onOutput(2)
      },
      destroy () {
        log('destroy 2')
      }
    })

    const instance = reflectPixieOutput(
      combinePixies({
        testPixie1,
        testPixie2
      })
    )(() => {}, onOutput)
    instance.update({ x: 2 })
    instance.destroy()
    log.assert([
      'output {}',
      'update 1 {"x":2,"output":{}}',
      'output {"testPixie1":1}',
      'update 2 {"x":2,"output":{}}',
      'output {"testPixie1":1,"testPixie2":2}',
      'update 1 {"x":2,"output":{"testPixie1":1,"testPixie2":2}}',
      'update 2 {"x":2,"output":{"testPixie1":1,"testPixie2":2}}',
      'destroy 1',
      'destroy 2'
    ])
  })
})
