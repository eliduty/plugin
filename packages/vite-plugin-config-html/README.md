# ⚡vite-plugin-config-html

[![npm](https://img.shields.io/npm/v/vite-plugin-config-html)](https://www.npmjs.com/package/vite-plugin-config-html) [![npm](https://img.shields.io/npm/dt/vite-plugin-config-html)](https://www.npmjs.com/package/vite-plugin-config-html)

该插件用于配置入口html，如果想通过环境变量来区分入口html中引入的资源，可以使用此插件。

## 安装

vite 版本: >=5.0.0

```shell
npm install -D vite-plugin-config-html
// 或
yarn add -D vite-plugin-config-html
// 或
pnpm install -D vite-plugin-config-html
```

## 选项

### title

设置网页标题配置。

### favicon

设置收藏夹图标。

### metas

设置meta标签。

### links

设置link标签。

### style

设置style标签。

### headScripts

设置头部script标签。

### preHeadScripts

在head标签开始位置，设置script标签。

### scripts

在body结束标签位置，设置script标签。

## 用法

```ts
// vite.config.ts
import configHtml from 'vite-plugin-config-html'

const options = {
  favicon: './logo.svg',
  headScripts: [
    `var msg = 'head script'
     console.log(msg);`,
    {
      async: true,
      src: 'https://abc.com/b.js',
      type: 'module',
    },
    { content: `console.log('hello')`, charset: 'utf-8' },
  ],
  preHeadScripts: [
    `var msg = 'pre head script'
    console.log(msg);`,
    {
      async: true,
      src: 'https://abc.com/b.js',
      type: 'module',
    },
    { content: `console.log('hello')`, charset: 'utf-8' },
  ],
  scripts: [
    `var msg = 'body script'
     console.log(msg);`,
    {
      async: true,
      src: 'https://abc.com/b.js',
      type: 'module',
    },
  ],
  metas: [
    {
      name: 'keywords',
      content: 'vite html meta keywords',
    },
    {
      name: 'description',
      content: 'vite html meta description',
    },
    {
      bar: 'custom meta',
    },
  ],
  links: [
    {
      rel: 'stylesheet',
      href: './style.css',
    },
    {
      rel: 'modulepreload',
      href: 'https://cn.vitejs.dev/assets/guide_api-plugin.md.6884005a.lean.js',
    },
  ],
  style: `body { color: red; };*{ margin: 0px }`,
}

module.exports = {
  plugins: [configHtml(options)],
}
```

## 输出

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script>var msg = 'pre head script'
          console.log(msg);</script>
    <script async src="https://abc.com/b.js" type="module"></script>
    <script charset="utf-8">console.log('hello')</script>

    <meta charset="UTF-8">
    <link rel="icon" href="./favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vite App</title>
    <!-- <script src="./iconfont/iconfont.js"></script> -->
    <link rel="shortcut icon" type="image/x-icon" href="./logo.svg">
    <meta name="keywords" content="vite html meta keywords">
    <meta name="description" content="vite html meta description">
    <meta bar="custom meta">
    <link rel="stylesheet" href="./style.css">
    <link rel="modulepreload" href="https://cn.vitejs.dev/assets/guide_api-plugin.md.6884005a.lean.js">
    <style>  body { color: red; };*{ margin: 0px }</style>
    <script>var msg = 'head script'
           console.log(msg);</script>
    <script async src="https://abc.com/b.js" type="module"></script>
    <script charset="utf-8">console.log('hello')</script>
    <script type="module" crossorigin src="./assets/index-C6MUBrDf.js"></script>
    <link rel="stylesheet" crossorigin href="./assets/index-uhSYYSbM.css">
    <script src="assets/iconfont1.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <script>var msg = 'body script'
           console.log(msg);</script>
    <script async src="https://abc.com/b.js" type="module"></script>
  </body>
</html>
```
