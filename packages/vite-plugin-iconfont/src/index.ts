import { join } from 'node:path';
import type { IndexHtmlTransformResult, Plugin } from 'vite';
import X2JS from 'x2js';
import { matchIconRegExp } from './config';
import {
  generateFile,
  getShakingJs,
  getShakingJson,
  getUrlsContent,
  mergeOption,
  normalizePath,
  validate
} from './helper';
import { createIconifyJson } from './iconify';
import type { Option } from './type';

export default async (opt: Option | Option[]): Promise<Plugin> => {
  const options = mergeOption(opt);
  // 参数验证
  if (!validate(options)) {
    throw new Error(`【vite-plugin-iconfont】 options url parameter is required`);
  }

  // 获取所有的js和json url
  const urls = options.map(item => [item.url, item.jsonUrl]).flat();

  const content = await getUrlsContent(urls);
  const urlContent: Record<string, string> = {};
  urls.forEach((url, index) => (urlContent[url] = content[index]));

  const injectArr: IndexHtmlTransformResult = [];
  const iconList: string[][] = [];

  // 生成文件
  options.forEach((opt, index) => {
    let JS_CONTENT = urlContent[opt.url];
    let JSON_CONTENT = urlContent[opt.jsonUrl];
    iconList.push(JS_CONTENT.match(matchIconRegExp) ?? []);
    // 生成下载图标配置
    if (opt.iconJson) {
      const iconJsonPath =
        opt.iconJson !== true ? opt.iconJson : index ? `iconfont${index}.json` : 'iconfont.json';
      JSON_CONTENT = opt?.pickIconList?.length
        ? getShakingJson(JSON_CONTENT, opt?.pickIconList)
        : JSON_CONTENT;
      generateFile(iconJsonPath, JSON_CONTENT);
    }

    // 生成ts类型声明文件
    if (opt.dts) {
      const iconList = JS_CONTENT.match(matchIconRegExp) ?? [];
      const dtsPath =
        opt.dts !== true ? opt.dts : index ? `iconfont${index}.d.ts` : 'iconfont.d.ts';
      const iconDts = `declare type Iconfont = "${iconList.join('"|"')}"`;
      generateFile(dtsPath, iconDts);
    }

    // 生成iconify.json
    if (opt.iconifyFile) {
      const parser = new X2JS();
      const iconXML = `${JS_CONTENT.match(/<svg>.*<\/svg>/i)}`;
      const iconfontObj: any = parser.xml2js(iconXML) || {};
      const iconfontSymbols = iconfontObj?.svg?.symbol
        ? Array.isArray(iconfontObj?.svg?.symbol)
          ? iconfontObj?.svg?.symbol
          : [iconfontObj?.svg?.symbol]
        : [];
      const iconifyJson = createIconifyJson(iconfontSymbols, opt.prefix!, opt.prefixDelimiter);
      const iconifyJsonString = JSON.stringify(iconifyJson);
      const iconifyPath =
        opt.iconifyFile !== true
          ? opt.iconifyFile
          : index
            ? `iconfont${index}.iconify.json`
            : 'iconfont.iconify.json';
      generateFile(iconifyPath, iconifyJsonString);
    }

    // 自动下载iconfont symbol js
    if (!opt.inject) {
      // 不自动注入 iconfont js，打包指定icon
      JS_CONTENT = opt?.pickIconList?.length
        ? getShakingJs(JS_CONTENT, opt?.pickIconList)
        : JS_CONTENT;
      const distUrl = opt.distUrl ? opt.distUrl : index ? `iconfont${index}.js` : 'iconfont.js';
      generateFile(normalizePath(distUrl), JS_CONTENT);
    }
  });

  let config: any;
  const packIconList: string[][] = [];

  return {
    name: 'vite-plugin-iconfont',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      const IS_DEV = config.command === "serve";

      options.forEach((opt, index) => {
        let JS_URL = opt.url;
        // 非开发环境使用本地地址
        if (!IS_DEV) {
          const { assetsDir } = config.build;
          const distUrl = opt.distUrl ? opt.distUrl : index ? `iconfont${index}.js` : 'iconfont.js';
          JS_URL = join(config.base, assetsDir, distUrl || '')
            .split('\\')
            .join('/');
        }
        opt.inject &&
          injectArr.push({
            tag: 'script',
            injectTo: 'head',
            attrs: { src: JS_URL }
          });
      });
    },
    transformIndexHtml: () => injectArr,
    transform: code => {
      // 收集需要打包的icon
      options.forEach((_, index) => {
        iconList[index]?.forEach(item => {
          if (code.includes(item)) {
            !packIconList?.[index]?.length
              ? (packIconList[index] = [item])
              : packIconList[index].push(item);
          }
        });
      });
    },
    generateBundle: () => {
      options.forEach((opt, index) => {
        if (opt.inject) {
          const { outDir, assetsDir } = config.build;

          const JS_CONTENT = opt.pickIconList?.length
            ? getShakingJs(urlContent[opt.url], opt.pickIconList)
            : opt.jsShaking && packIconList[index]?.length
              ? getShakingJs(urlContent[opt.url], packIconList[index])
              : urlContent[opt.url];
          const distUrl = opt.distUrl ? opt.distUrl : index ? `iconfont${index}.js` : 'iconfont.js';
          // 匹配使用的到icon
          const distPath = normalizePath(join(outDir, assetsDir, distUrl));
          generateFile(distPath, JS_CONTENT);
        }
      });
    }
  };
};
