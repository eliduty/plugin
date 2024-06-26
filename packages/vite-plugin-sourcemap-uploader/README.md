# ⚡vite-plugin-iconfont

[![npm](https://img.shields.io/npm/v/vite-plugin-sourcemap-uploader)](https://www.npmjs.com/package/vite-plugin-sourcemap-uploader) [![npm](https://img.shields.io/npm/dt/vite-plugin-sourcemap-uploader)](https://www.npmjs.com/package/vite-plugin-sourcemap-uploader)

这是一个自动下载iconfont symbol js到项目的vite 插件，支持以下特性：

- 自动下载iconfont symbol js 到本地，构建时进行Tree-Shaking优化。
- 自动生成iconfont json配置。
- 自动生成iconfont TypeScript类型声明文件。
- 支持构建时自动注入index.html。
- 支持生成iconify文件，配合[Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify)可实现图标预览和自动补全。
- 多图标库支持，自定义图标打包。

## 安装

```shell
npm install -D vite-plugin-iconfont
// 或
yarn add -D vite-plugin-iconfont
// 或
pnpm install -D vite-plugin-iconfont
```

## 基本使用方法

添加插件到`vite.config.js`

- 单图标库

```js
import { defineConfig } from 'vite';
import Iconfont from 'vite-plugin-iconfont';
export default defineConfig({
  plugins: [
    Iconfont({
      url: 'iconfont symbol js url'
    })
  ]
});
```

- 多图标库

```js
import { defineConfig } from 'vite';
import Iconfont from 'vite-plugin-iconfont';
export default defineConfig({
  plugins: [
    Iconfont([{
      url: 'iconfont symbol js url1'
    },
    {
      url: 'iconfont symbol js url2'
    },
    //...another options
    ])
  ]
});
```

## 配置选项(options)

### 类型说明

```ts
Iconfont(opt: Option | Option[]) => Promise<Plugin>;
```

```ts
interface Option {
    /**
     * iconfont symbol js url
     */
    url: string;
    /**
     * 保存自动下载iconfont symbol js的路径
     */
    distUrl?: string;
    /**
     * iconfont symbol js是否自动注入到index.html
     */
    inject?: boolean;
    /**
     * 是否生成icon类型声明文件，可以为boolean或者具体生成的路径
     */
    dts?: boolean | string;
    /**
     * 自动生成iconfont图标集合
     */
    iconJson?: boolean | string;
    /**
     * 图标前缀, 默认icon
     */
    prefix?: string;
    /**
     * 图标前缀中的分隔符，默认为-
     */
    prefixDelimiter?: string;
    /**
     * iconifyjson文件生成的路径
     */
    iconifyFile?: boolean | string;
    /**
     * 是否进行摇树优化
     */
    jsShaking?: boolean;
    /**
     * 指定图标集合进行打包
     */
    pickIconList?: string[];
}
```

### 详细说明

#### url

iconfont使用symbol引用方式，生成的项目js地址，该参数为主要输入参数。

- **Type :** `string`
- **Default :** ''
- **Required :**`true`

#### distUrl

保存iconfont到项目的js地址。

- **Type :** `string`
- **Default :** `iconfont.js`
- **Required :**`false`

#### iconJson

生成iconfont json配置路径，默认文件名称：`iconfont.json` 。

- **Type :** `boolean|string`
- **Default :** `false`
- **Required :**`false`

#### inject

iconfont symbol js是否自动注入到`index.html`文件。

当`inject:false`时，不进行图标Tree-Shaking优化，并须配置distUrl和手动将文件路径注入到index.html文件中。

当`inject:true`时，构建时将进行图标Tree-Shaking优化，distUrl将受vite的`base`和`build.assetsDir`配置影响，并自动注入到`index.html`文件。

最佳实践建议：当`inject:true`时，可不配置distUrl参数，采用插件内置规则自动注入。

- **Type :** `boolean`
- **Default :** `true`
- **Required :**`false`

#### dts

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

#### prefix

图标前缀，iconfont默认为`icon`。

**注意：和iconfont设置的前缀不一样，如果iconfnt上设置的前缀为icon-，则需要设置prefix为icon，prefixDelimiter为-。即：`iconfont前缀 = prefix + prefixDelimiter`**

- **Type :** `string`
- **Default :** `icon`
- **Required :**`false`

#### prefixDelimiter

图标前缀中的分隔符，默认为-

- **Type :** `string`
- **Default :** `-`
- **Required :**`false`

#### iconifyFile

iconifyjson文件生成的路径，不设置则不生成。

- **Type :** `string`
- **Default :** ``
- **Required :**`false`

#### jsShaking

开启图标库的tree-Shaking优化,`inject:true`时有效。

- **Type :** `boolean`
- **Default :** `true`
- **Required :**`false`

#### pickIconList

需要提取的图标列表，不设置则提取所有图标。

- **Type :** `string[]`
- **Default :** `[]`
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
        url: 'iconfont symbol js url',
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
      url: 'iconfont symbol js url', // 替换成你自己的iconfont项目地址
      distUrl: './public/iconfont/iconfont.js',
      prefix: 'icon-', // 默认为icon-，可不设置
      iconifyFile: './.iconify.json' // 关键是设置这个
    }),
  ```

2. 安装vscode插件[Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify)。

3. 在项目vscode配置`.vscode/settings.json`中增加配置。

  ```json
  {
    "iconify.customCollectionJsonPaths": ["./.iconify.json"]
  }
  ```

4. 重启或者重载一下编辑器窗口（cmd+shift+p，然后Reload window）即可成功预览图标，效果如下。
![预览](https://github.com/eliduty/plugin/blob/main/packages/vite-plugin-iconfont/img/iconify_preview.png?raw=true)
![自动补全](https://github.com/eliduty/plugin/blob/main/packages/vite-plugin-iconfont/img/iconify_completion.png?raw=true)
