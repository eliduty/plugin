import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
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
      Iconfont([
        {
          // url: "//at.alicdn.com/t/c/font_3440485_sjvdwyillne.js",
          url: '//at.alicdn.com/t/c/font_2406373_y1qirr71rlo.js',
          // distUrl: "./public/iconfont/iconfont.js",
          iconJson: './src/components/IconPicker/data1.json',
          // inject: false,
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
