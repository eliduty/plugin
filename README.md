# ⚡vite-plugin-iconfont

[![npm](https://img.shields.io/npm/v/vite-plugin-iconfont)](https://www.npmjs.com/package/vite-plugin-iconfont) [![npm](https://img.shields.io/npm/dt/vite-plugin-iconfont)](https://www.npmjs.com/package/vite-plugin-iconfont)

这是一个自动下载iconfont symbol js到项目的vite 插件，支持以下特性：

- 自动下载iconfont symbol js 到本地，支持构建时自动注入index.html。
- 自动生成iconfont json配置。
- 自动生成iconfont TypeScript类型声明文件。

## 安装

```shell
npm install -D vite-plugin-iconfont
// 或
yarn add -D vite-plugin-iconfont
// 或
pnpm install -D vite-plugin-iconfont
```

## 使用方法

添加插件到`vite.config.js`

```js
import { defineConfig } from 'vite';
import Iconfont from 'vite-plugin-iconfont';
export default defineConfig({
  plugins: [Iconfont({ url: '//at.alicdn.com/t/c/font_3303_220hwi541tl8.js'})]
});
```

## 配置选项(options)

### url

iconfont使用symbol引用方式，生成的项目js地址，配置后将自动下载文件到本地。

- **Type :** `string`
- **Default :** ''
- **Required :**`true`

### distUrl

iconfont使用symbol引用方式，生成的项目js地址，配置后将自动下载文件到本地。

- **Type :** `string`
- **Default :** `iconfont.js`
- **Required :**`false`

### iconJson

生成iconfont json配置路径，默认文件名称：`iconfont.json` 。

- **Type :** `boolean|string`
- **Default :** `false`
- **Required :**`false`

### inject

iconfont symbol js是否自动注入到`index.html`文件

- **Type :** `boolean`
- **Default :** `true`
- **Required :**`false`

### dts

生成TypeScript 类型声明文件,`false`不生成，也可以是具体生成类型声明文件的文件路径地址，默认文件名称：`iconfont.d.ts`。

- **Type :** `boolean|string`
- **Default :** `false`
- **Required :**`false`

## 示例

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Iconfont from 'vite-plugin-iconfont';
// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    plugins: [
      vue(),
      Iconfont({
        url: '//at.alicdn.com/t/c/font_3303_220hwi541tl8.js',
        distUrl: './public/assets/fonts/iconfont.js',
        iconJson: './public/iconfont.json',
        dts: './types/iconfont.d.ts',
        inject:false
      }),
    ]
  });
};

```
