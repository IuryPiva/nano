/* eslint-disable no-dupe-class-members */
class Tester {
  _isAutomated = window.navigator.webdriver

  sendId = 0
  _description: any
  stats = { error: 0, warn: 0, success: 0 }
  tests: { description: string; fnc: Function }[] = []

  constructor() {
    // const style = document.createElement('style')
    // style.innerText = 'body { color: #f8f8f2; background: #0c0e14; }'
    // document.head.appendChild(style)
  }

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

      // TODO(yandeu): check indent first
      const tester = this.testerDocument
      const title = document.createElement('h3')
      title.innerText = description
      title.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      title.style.fontWeight = '300'

      const ul = document.createElement('ul')
      ul.style.listStyle = 'none'
      ul.style.paddingLeft = '20px'
      tester?.appendChild(title)
      tester?.appendChild(ul)

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

  get testerDocument() {
    const tester = document.getElementById('tester') as HTMLElement
    tester.style.padding = '4% 10%'

    tester.style.position = 'absolute'
    tester.style.top = '0'
    tester.style.left = '0'
    tester.style.background = '#f8f8f2aa'
    tester.style.width = '100%'
    tester.style.height = '100%'
    tester.style.boxSizing = 'border-box'
    return tester
  }

  sendToPuppeteer(msg) {
    // add to dom
    const tester = this.testerDocument
    if (tester) {
      const ul = tester.lastChild as HTMLElement

      const li = document.createElement('li')

      /*
      // remove colors
      p.innerText = msg
        // eslint-disable-next-line no-control-regex
        .replace(/[\x30-\x32]|\x1b/g, '')
        .replace(/\[\d?;?m/gm, '')
        */
      const escapeHtml = (unsafe: string) => {
        if (unsafe && typeof unsafe === 'string')
          return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
        return unsafe
      }

      const replacer = (color: string) => (match, p1, p2, p3, offset, string) => {
        console.log('match', match)
        return `<span style="color:${color};">${escapeHtml(p2)}</span>`
      }

      console.log('msg', msg)
      // convert colors
      li.innerHTML = msg
        .replace(/\r\n|\n|\r/gm, '')
        // eslint-disable-next-line no-control-regex
        .replace(/\x1b/g, '')
        .replace(/(\[32;1m)(.*?)(\[0m)/gm, replacer('lightgreen'))
        .replace(/(\[31m)(.*?)(\[0m)/gm, replacer('red'))
        .replace(/(\[32m)(.*?)(\[0m)/gm, replacer('green'))
        .replace(/(\[90m)(.*?)(\[0m)/gm, replacer('gray '))

      ul.appendChild(li)
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
  describe('my first test', async () => {
    expect(typeof 'hello').toBe('string', 'some message')
    expect(typeof 'hello').toBe('string')
    await Test.wait(2000)
    expect(99 - 8).toBe(72)
    expect(99 - 8).not.toBe(72)
    expect(99 - 8).not.toBe(91)
  })
})
