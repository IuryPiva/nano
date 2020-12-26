// inspired by https://codesandbox.io/s/build-own-react-router-v4-mpslz

import { Component } from '../../component'
import { FC, h, _render } from '../../core'

let instances: any[] = []

const register = (comp: any) => instances.push(comp)
const unregister = (comp: any) => instances.splice(instances.indexOf(comp), 1)

const historyPush = (path: string) => {
  window.history.pushState({}, '', path)
  instances.forEach((instance) => instance.handlePop())
}

const historyReplace = (path: string) => {
  window.history.replaceState({}, '', path)
  instances.forEach((instance) => instance.handlePop())
}

const matchPath = (pathname: string, options: { exact?: boolean; path: string }) => {
  const { exact = false, path } = options

  if (!path) {
    return {
      path: null,
      url: pathname,
      isExact: true,
    }
  }

  const match = new RegExp(`^${path}`).exec(pathname)

  if (!match) return null

  const url = match[0]
  const isExact = pathname === url

  if (exact && !isExact) return null

  return {
    path,
    url,
    isExact,
  }
}

export class Switch extends Component {
  path: string = ''

  didMount() {
    register(this)
  }

  didUnmount() {
    unregister(this)
  }

  handlePop() {
    if (this.shouldUpdate()) this.update()
  }

  shouldUpdate() {
    let found = false

    this.props.children.forEach((child: any) => {
      const { path, exact } = child.props
      const match = matchPath(window.location.pathname, { path, exact })
      if (match) {
        found = this.path !== path
      }
    })

    return found
  }

  render() {
    let component

    this.props.children.forEach((child: any) => {
      const { path, exact } = child.props
      const match = matchPath(window.location.pathname, { path, exact })
      if (match) {
        component = child
        this.path = path
      }
    })

    if (component) {
      let el = _render(component)
      return _render(el)
    } else return h('div', { class: 'route' }, 'not found')
  }
}

export const Route: FC<{ path: string; children?: any }> = ({ children }) => {
  return children
}

export const Link: FC<{ to: string; replace?: boolean; children?: any }> = ({ to, replace, children }) => {
  const handleClick = (event: Event) => {
    event.preventDefault()
    replace ? historyReplace(to) : historyPush(to)
  }

  return h('a', { href: to, onClick: (e: Event) => handleClick(e) }, children)
}
