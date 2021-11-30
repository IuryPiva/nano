/* eslint-disable no-dupe-class-members */
class Tester {
  _isAutomated = window.navigator.webdriver

  sendId = 0
  _description
  stats = { error: 0, warn: 0, success: 0 }
  tests = []

  end() {
    const total = this.stats.error + this.stats.warn + this.stats.success
    const success = this.stats.success
    const passing = this.clr.lightGreen(`${success}/${total} passing`)

    setTimeout(() => {
      this.sendToPuppeteer(`\n${this.indent}${passing}\n`)
      const done = document.createElement('div')
      done.innerText = 'done'
      done.id = 'done'
      document.body.appendChild(done)
    }, 100)
  }

  async start() {
    for (let i = 0; i < this.tests.length; i++) {
      const { description, fnc } = this.tests[i]
      this._description = description
      await fnc()
    }
    this.end()
  }

  describe(description, fnc) {
    this.tests.push({ description, fnc })
  }

  async wait(ms = 100): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

  error(assertion, message = '-') {
    if (assertion === true) {
      this.stats.success++
      this.sendSuccess(message)
    } else {
      this.stats.error++
      this.sendError(message, assertion)
    }
  }

  get indent() {
    return '  '
  }

  get sym() {
    return {
      fail: '✘',
      pass: '✔'
    }
  }

  get clr() {
    return {
      red: text => `\u001b[31m${text}\u001b[0m`,
      green: text => `\u001b[32m${text}\u001b[0m`,
      lightGreen: text => `\u001b[32;1m${text}\u001b[0m`,
      gray: text => `\u001b[90m${text}\u001b[0m`
    }
  }

  title(title) {}

  sendSuccess(msg, assertion?) {
    const symbol = this.clr.lightGreen(this.sym.pass)
    const message = this.clr.gray(msg)
    this.sendToPuppeteer(`${this.indent}${symbol} ${message}`)
  }

  sendError(msg, assertion) {
    const error = this.clr.red(`${this.sym.fail} ${msg}`)
    const description = this.clr.gray(`${this.indent}${this.indent}${this._description || ''}\n`)
    this.sendToPuppeteer(`\n${this.indent}${error}\n${this._description ? description : ''}`)
  }

  sendToPuppeteer(msg) {
    // add to dom
    const tester = document.getElementById('tester')
    if (tester) {
      const p = document.createElement('p')
      // remove colors
      p.innerText = msg
        // eslint-disable-next-line no-control-regex
        .replace(/[\x30-\x32]|\x1b/g, '')
        .replace(/\[\d?;?m/gm, '')

      tester.appendChild(p)
    }

    if (!this._isAutomated) {
      console.log(msg.replace(/;1/, ''))
      return
    }

    fetch('http://localhost:8080/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: msg, id: this.sendId++ })
    })
  }

  expect(assertion: any)
  expect(type: 'error' | 'warn' | 'ignore', assertion: any)
  expect(a: 'error' | 'warn' | 'ignore' | any, b?: any) {
    const assertion = b || a
    const type: 'error' | 'warn' | 'ignore' = b ? a : 'error'

    let not = false

    const toBe = (expectation: any, message: string = '') => {
      let isTrue = assertion === expectation
      if (not) isTrue = !isTrue

      const should = not ? 'should NOT be' : 'should be'

      if (isTrue && message) this[type](isTrue, message)
      else if (message) this[type](isTrue, `${message}: (${should} "${expectation}", got "${assertion}")`)
      else this[type](isTrue, `${should} "${expectation}", got "${assertion}"`)
    }

    return {
      toBe: toBe,
      get not() {
        not = !not
        return { toBe }
      }
    }
  }
}

const Test = new Tester()
//@ts-ignore
const expect = Test.expect.bind(Test)
//@ts-ignore
const describe = Test.describe.bind(Test)
//@ts-ignore
const description = Test.describe.bind(Test)

setTimeout(() => {
  expect(typeof 'hello').toBe('string', 'some message')
  expect(typeof 'hello').toBe('string')
  expect(99 - 8).toBe(72)
  expect(99 - 8).not.toBe(72)
  expect(99 - 8).not.toBe(91)
}, 1000)
