<div align="center">

<img src="readme/nano-jsx-logo.png" alt="Nano JSX Logo" width="230"/>

</div>

<h4 align="center">
Written in TypeScript, super Lightweight, simply Awesome!</h4>

<p align="center">  
  <a href="https://www.npmjs.com/package/nano-jsx"><img src="https://img.shields.io/npm/v/nano-jsx?style=flat-square" alt="NPM version"></a>
  <a href="https://github.com/yandeu/nano-jsx/actions?query=workflow%3ACI"><img src="https://img.shields.io/github/workflow/status/yandeu/nano-jsx/CI/master?label=github%20build&logo=github&style=flat-square"></a>
  <a href="https://github.com/yandeu/nano-jsx/commits/master"><img src="https://img.shields.io/github/last-commit/yandeu/nano-jsx.svg?style=flat-square" alt="GitHub last commit"></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" alt="code style: prettier"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/built%20with-TypeScript-blue?style=flat-square"></a>
  <a href="https://codecov.io/gh/yandeu/nano-jsx"><img src="https://img.shields.io/codecov/c/github/yandeu/nano-jsx?logo=codecov&style=flat-square" alt="Codecov"/></a>
</p>

<hr>

The documentation will be available soon.

## Features

- **SSR**  
  Out of the box, very simple to use

- **Hydration**  
  Render your app on the server and hydrate it on the client

- **Partial Hydration**  
  Hydrate and only the parts you need

- **CSS in JS**  
  Use JavaScript objects for styling

- **No JSX build tools required**  
  Uses Tagged Templates instead of JSX if you prefer

- **Props, Ref, Context and Events**  
  Use Props, Ref, Context API and Events as you are used to in react

- **Inline SVG**  
  No problem

- **Prefetch**  
  Use the built-in Link Component

- **1KB (gzip)**  
  All of this in only ~1KB  
  _(Well, the core module is only about ~1KB,_  
  _together with all the cool features it's ~2.3KB)_

## Why

Well, in the past, I did a lot of websites using Isomorphic React (Pre-Rendering on the Server and Hydrating it on the client). Once the website did load all scripts, the website was very fast (not so much on mobile though). But the script where always _way_ too big.

Nowadays, I prefer to pre-render the JSX on the server and only hydrate the parts that are needed. The client now only gets few kilobytes and uses much less CPU.

Of course with this new approach, the client does not have a router and must thus fetch each new site on navigating to it. But, this is not really a problem since the static html is usually very small and we can easily prefetch pages using `<link rel="prefetch" href="index.html" as="document">` on page load or on hovering over a link.

## \<Link />

Nano JSX provides a fancy **link component** for prefetching pages.

```jsx
// prefetch the link on page load
<Link prefetch href="https://geckosio.github.io/">
  Link to geckos.io
</Link>

// prefetch the link if user hovers over it
<Link prefetch="hover" href="https://geckosio.github.io/">
  Link to geckos.io
</Link>

// prefetch the link if it is visible
<Link prefetch="visible" href="https://geckosio.github.io/">
  Link to geckos.io
</Link>
```

## \<Visible />

This children of Visible will only be rendered and added to the dom, if they are visible. This is useful, for example, for a comment section. (Does not work to lazy load images)

```jsx
// some lazy loaded component
<Visible>
  <div>
    <p>Will be rendered once in the visible area.</p>
    <script>
      console.log('visible!')
    </script>
  </div>
</Visible>

// the comments section
<Visible>
  <Comments />
</Visible>
```

## \<Img />

Lazy Loading Images.

```jsx
// lazy load an image
<img src="imageURL" />

// lazy load an image, displays a blue box while loading
<div style={{width:100, height:100, backgroundColor: 'blue'}}>
  <img src="imageURL" />
</div>

// lazy load an image with a placeholder image
<img src="imageURL" placeholder="placeholderURL" />

// lazy load an image with a placeholder component
<img src="imageURL" placeholder={Placeholder} />
```
