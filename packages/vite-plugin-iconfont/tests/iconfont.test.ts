import Iconfont, { defaultOptions, matchIconRegExp } from 'vite-plugin-iconfont';
import { describe, expect, test } from 'vitest';

describe('插件功能测试', () => {
  describe('测试快照', () => {
    test('插件默认配置，应该不变', () => {
      expect(defaultOptions).toMatchInlineSnapshot(`
        {
          "distUrl": "iconfont.js",
          "dts": false,
          "iconJson": false,
          "inject": true,
          "prefix": "icon",
          "prefixDelimiter": "-",
          "url": "",
        }
      `);
    });

    test('iconfont symbol匹配icon正则，应该不变', () => {
      expect(matchIconRegExp).toMatchInlineSnapshot(`/\\(\\?<=id="\\)\\.\\+\\?\\(\\?="\\)/g`);
    });
  });

  describe('异常验证', () => {
    test('传入一个数组对象，如果不包含url，应该抛出【vite-plugin-iconfont】 options url parameter is required异常', () => {
      expect(Iconfont([])).rejects.toThrowError('【vite-plugin-iconfont】 options url parameter is required');
    });

    test('传入一个对象，如果不包含url地址，应该抛出【vite-plugin-iconfont】 options url parameter is required异常', () => {
      // @ts-ignore
      expect(Iconfont({})).rejects.toThrowError('【vite-plugin-iconfont】 options url parameter is required');
    });
  });

  describe('正常验证', () => {
    test('传入参数对象中包含url', () => {
      expect(
        Iconfont({
          url: 'http://at.alicdn.com/t/c/font_2406373_y1qirr71rlo.js'
        })
      );
    });
  });
});
