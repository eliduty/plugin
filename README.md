# ⚡vite-plugin-iconfont

[![npm](https://img.shields.io/npm/v/vite-plugin-iconfont)](https://www.npmjs.com/package/vite-plugin-iconfont) [![npm](https://img.shields.io/npm/dt/vite-plugin-iconfont)](https://www.npmjs.com/package/vite-plugin-iconfont)

这是一个自动下载iconfont symbol js到项目的vite 插件，支持以下特性：

- 自动下载iconfont symbol js 到本地。
- 自动生成iconfont json配置。
- 自动生成iconfont TypeScript类型声明文件。
- 支持构建时自动注入index.html。
- 支持生成iconify文件，配合[Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify)可实现图标预览和自动补全

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
  plugins: [
    Iconfont({
      url: '//at.alicdn.com/t/c/font_3303_220hwi541tl8.js'
    })
  ]
});
```

## 配置选项(options)

### url

iconfont使用symbol引用方式，生成的项目js地址，该参数为主要输入参数。

- **Type :** `string`
- **Default :** ''
- **Required :**`true`

### distUrl

保存iconfont到项目的js地址。

- **Type :** `string`
- **Default :** `iconfont.js`
- **Required :**`false`

### iconJson

生成iconfont json配置路径，默认文件名称：`iconfont.json` 。

- **Type :** `boolean|string`
- **Default :** `false`
- **Required :**`false`

### inject

iconfont symbol js是否自动注入到`index.html`文件。

- **Type :** `boolean`
- **Default :** `true`
- **Required :**`false`

### dts

生成TypeScript 类型声明文件,`false`不生成，也可以是具体生成类型声明文件的文件路径地址，默认文件名称：`iconfont.d.ts`。

- **Type :** `boolean|string`
- **Default :** `false`
- **Required :**`false`

>注意：要获得eslint的支持请在eslint配置文件中增加如下配置：

```js
{
  globals: {
    Iconfont: true,
  },
  ...
}
```

### prefix

图标前缀，iconfont默认为`icon`。

**注意：和iconfont设置的前缀不一样，如果iconfnt上设置的前缀为icon-，则需要设置prefix为icon，prefixDelimiter为-。即：`iconfont前缀 = prefix + prefixDelimiter`**

- **Type :** `string`
- **Default :** `icon`
- **Required :**`false`

### prefixDelimiter

图标前缀中的分隔符，默认为-

- **Type :** `string`
- **Default :** `-`
- **Required :**`false`

### iconifyFile

iconifyjson文件生成的路径，不设置则不生成。

- **Type :** `string`
- **Default :** ``
- **Required :**`false`

### size

图标大小，默认是1024，注意不是实际显示的大小，而是viewBox的，现在iconfont默认是1024，所以不需要设置，使用默认值就行，请谨慎修改。

- **Type :** `number`
- **Default :** `1024`
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

## 使用iconify

如果使用[Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify)，可以不生成dts，也可使用自动补全，还可以实时预览，使用方法如下：

1. 设置对应参数，如：

```js
Iconfont({
  url: '你的iconfont项目地址', // 替换成你自己的iconfont项目地址
  distUrl: './public/iconfont/iconfont.js',
  prefix: 'icon-', // 默认为icon-，可不设置
  iconifyFile: './.iconify.json' // 关键是设置这个
}),
```

2. 安装vscode插件[Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify)

3. 在项目vscode配置`.vscode/settings.json`中增加配置

```json
{
  "iconify.customCollectionJsonPaths": ["./.iconify.json"]
}
```

4. 重启或者重载一下编辑器窗口（cmd+shift+p，然后Reload window）即可成功预览图标，效果如下。
![预览](https://raw.githubusercontent.com/eliduty/vite-plugin-iconfont/main/img/iconify_preview.png)
![自动补全](https://raw.githubusercontent.com/eliduty/vite-plugin-iconfont/main/img/iconify_completion.png)
