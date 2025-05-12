import { URL, fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import ConfigHtml from '../packages/vite-plugin-config-html/src/index.ts';
import Iconfont from '../packages/vite-plugin-iconfont/src/index.ts';

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    base: './',
    // vite config
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    plugins: [
      vue(),
      ConfigHtml({
        favicon: './logo.svg',
        headScripts: [
          `var msg = 'head script'
           console.log(msg);`,
          {
            async: true,
            src: 'https://abc.com/b.js',
            type: 'module'
          },
          { content: `console.log('hello')`, charset: 'utf-8' }
        ],
        preHeadScripts: [
          `var msg = 'pre head script'
          console.log(msg);`,
          {
            async: true,
            src: 'https://abc.com/b.js',
            type: 'module'
          },
          { content: `console.log('hello')`, charset: 'utf-8' }
        ],
        scripts: [
          `var msg = 'body script'
           console.log(msg);`,
          {
            async: true,
            src: 'https://abc.com/b.js',
            type: 'module'
          }
        ],
        metas: [
          {
            name: 'keywords',
            content: 'vite html meta keywords'
          },
          {
            name: 'description',
            content: 'vite html meta description'
          },
          {
            bar: 'custom meta'
          }
        ],
        links: [
          {
            rel: 'stylesheet',
            href: './style.css'
          },
          {
            rel: 'modulepreload',
            href: 'https://cn.vitejs.dev/assets/guide_api-plugin.md.6884005a.lean.js'
          }
        ],
        style: `body { color: red; };*{ margin: 0px }`
      }),
      Iconfont([
        {
          // url: "//at.alicdn.com/t/c/font_3440485_sjvdwyillne.js",
          url: '//at.alicdn.com/t/c/font_2406373_y1qirr71rlo.js',
          distUrl: './public/iconfont/iconfont.js',
          iconJson: './src/components/IconPicker/data1.json',
          inject: false,
          dts: './types/iconfont.d.ts',
          iconifyFile: '../.vscode/.iconify.json'
        },
        {
          // url: "//at.alicdn.com/t/c/font_3440485_sjvdwyillne.js",
          url: '//at.alicdn.com/t/c/font_2406373_y1qirr71rlo.js',
          // distUrl: "./public/iconfont/iconfont.js",
          iconJson: './src/components/IconPicker/data2.json',
          // inject: false,
          dts: './types/iconfont.d.ts',
          iconifyFile: '../.vscode/.iconify.json'

          // pickIconList: ['icon-border-inner']
        }
      ])
    ]
  });
};
