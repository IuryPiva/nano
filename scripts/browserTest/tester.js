"use strict";
/* eslint-disable no-dupe-class-members */
class Tester {
    constructor() {
        this._isAutomated = window.navigator.webdriver;
        this.sendId = 0;
        this.stats = { error: 0, warn: 0, success: 0 };
        this.tests = [];
        window.addEventListener('DOMContentLoaded', () => {
            const tester = document.createElement('div');
            tester.id = 'tester';
            tester.style.padding = '4% 10%';
            tester.style.position = 'absolute';
            tester.style.top = '0';
            tester.style.left = '0';
            tester.style.background = '#161925';
            tester.style.width = '100%';
            tester.style.height = '100%';
            tester.style.boxSizing = 'border-box';
            document.body.appendChild(tester);
            const testerHud = this.createElement('div', null, this.createElement('div', 'passes'), this.createElement('div', 'failures'), this.createElement('div', 'duration'));
            testerHud.id = 'tester-hud';
            testerHud.style.position = 'fixed';
            testerHud.style.top = '24px';
            testerHud.style.right = '24px';
            document.body.appendChild(testerHud);
            const style = document.createElement('style');
            style.innerText = `
        #tester { 
          color: #F8F8F2;
          background: #0c0e14;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        #tester-hud {
          color: #F8F8F2;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;     
        }
      `.replace(/\r\n|\n|\r/gm, '');
            document.head.appendChild(style);
        });
    }
    end() {
        const total = this.stats.error + this.stats.warn + this.stats.success;
        const success = this.stats.success;
        const passing = this.clr.lightGreen(`${success}/${total} passing`);
        setTimeout(() => {
            this.sendToPuppeteer(`\n${this.indent}${passing}\n`, 'end');
            const done = this.createElement('div', 'done');
            done.id = 'done';
            document.body.appendChild(done);
        }, 100);
    }
    start() {
        window.addEventListener('load', async () => {
            for (let i = 0; i < this.tests.length; i++) {
                const { description, fnc } = this.tests[i];
                // TODO(yandeu): check indent first
                const tester = this.testerDocument;
                this.sendToPuppeteer(`• ${description}`);
                const ul = this.createElement('ul');
                ul.style.listStyle = 'none';
                ul.style.paddingLeft = '20px';
                tester === null || tester === void 0 ? void 0 : tester.appendChild(ul);
                this._description = description;
                await fnc();
            }
            this.end();
        });
    }
    describe(description, fnc) {
        this.tests.push({ description, fnc });
    }
    async wait(ms = 100) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }
    error(assertion, message = '-') {
        if (assertion === true) {
            this.stats.success++;
            this.sendSuccess(message);
        }
        else {
            this.stats.error++;
            this.sendError(message, assertion);
        }
    }
    get indent() {
        return '  ';
    }
    get sym() {
        return {
            fail: '✘',
            pass: '✔'
        };
    }
    get clr() {
        return {
            red: text => `\u001b[31m${text}\u001b[0m`,
            green: text => `\u001b[32m${text}\u001b[0m`,
            lightGreen: text => `\u001b[32;1m${text}\u001b[0m`,
            gray: text => `\u001b[90m${text}\u001b[0m`
        };
    }
    title(title) { }
    sendSuccess(msg, assertion) {
        const symbol = this.clr.lightGreen(this.sym.pass);
        const message = this.clr.gray(msg);
        this.sendToPuppeteer(`${this.indent}${symbol} ${message}`);
    }
    sendError(msg, assertion) {
        const error = this.clr.red(`${this.sym.fail} ${msg}`);
        const description = this.clr.gray(`${this.indent}${this.indent}${this._description || ''}\n`);
        this.sendToPuppeteer(`\n${this.indent}${error}\n${this._description ? description : ''}`);
    }
    get testerDocument() {
        return document.getElementById('tester');
    }
    createElement(tag, innerHTML, ...children) {
        const el = document.createElement(tag);
        if (innerHTML)
            el.innerHTML = innerHTML;
        if (children)
            children.forEach(c => {
                el.appendChild(c);
            });
        return el;
    }
    /** Turns ascii colors to <span /> with color styles. */
    colorify(text) {
        const escapeHtml = (unsafe) => {
            if (unsafe && typeof unsafe === 'string')
                return unsafe
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
            return unsafe;
        };
        const replacer = (color) => (match, p1, p2, p3, offset, string) => {
            return `<span style="color:${color};">${escapeHtml(p2)}</span>`;
        };
        // convert colors
        return (text
            .replace(/\r\n|\n|\r/gm, '')
            // eslint-disable-next-line no-control-regex
            .replace(/\x1b/g, '')
            .replace(/(\[32;1m)(.*?)(\[0m)/gm, replacer('#50FA7B'))
            .replace(/(\[31m)(.*?)(\[0m)/gm, replacer('#FF5555'))
            .replace(/(\[32m)(.*?)(\[0m)/gm, replacer('#2FD651'))
            .replace(/(\[90m)(.*?)(\[0m)/gm, replacer('#656B84')));
    }
    sendToPuppeteer(msg, type) {
        // add to dom
        const tester = this.testerDocument;
        if (tester) {
            if (type === 'end') {
                const p = this.createElement('p', this.colorify(msg));
                tester.appendChild(p);
            }
            else if (msg.startsWith('• ')) {
                const title = this.createElement('h3', msg.slice(2));
                title.style.fontWeight = '300';
                tester.appendChild(title);
            }
            else {
                const ul = tester.lastChild;
                const li = this.createElement('li');
                li.innerHTML = this.colorify(msg);
                ul.appendChild(li);
            }
        }
        if (!this._isAutomated) {
            console.log(msg.replace(/;1/, ''));
            return;
        }
        fetch('http://localhost:8080/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: msg, id: this.sendId++ })
        });
    }
    expect(a, b) {
        const assertion = b || a;
        const type = b ? a : 'error';
        let not = false;
        const toBe = (expectation, message = '') => {
            let isTrue = assertion === expectation;
            if (not)
                isTrue = !isTrue;
            const should = not ? 'should NOT be' : 'should be';
            if (isTrue && message)
                this[type](isTrue, message);
            else if (message)
                this[type](isTrue, `${message}: (${should} "${expectation}", got "${assertion}")`);
            else
                this[type](isTrue, `${should} "${expectation}", got "${assertion}"`);
        };
        return {
            toBe: toBe,
            get not() {
                not = !not;
                return { toBe };
            }
        };
    }
}
const Test = new Tester();
//@ts-ignore
const expect = Test.expect.bind(Test);
//@ts-ignore
const describe = Test.describe.bind(Test);
//@ts-ignore
const description = Test.describe.bind(Test);
setTimeout(() => {
    describe('my first test', async () => {
        expect(typeof 'hello').toBe('string', 'some message');
        expect(typeof 'hello').toBe('string');
        await Test.wait(2000);
        expect(99 - 8).toBe(72);
        expect(99 - 8).not.toBe(72);
        expect(99 - 8).not.toBe(91);
    });
});
