import { fileURLToPath, URL } from 'node:url';
import { writeFile } from 'fs/promises';
import type { Plugin, IndexHtmlTransformResult } from 'vite';
interface Options {
  /**
   * iconfont url
   */
  url: string,
  /**
   * 是否生成icon类型声明文件，可以为boolean或者具体生成的路径
   */
  dts: boolean | string,
  /**
   * 自动下载iconfont到本地
   */
  distFilePath: string,
  /**
   * 自动生成iconfont图标集合
   */
  iconFilePath:string
}


export default function Iconfont(options:Options):Plugin {
  const dtsPath = options.dts === true ? '../iconfont.d.ts' : options.dts;
  return {
    name: 'vite-plugin-iconfont',
    async transformIndexHtml() {
      const URL_CONTENT = await getURLContent(options.url);
      const iconList = URL_CONTENT.match(/(?<=id=").+?(?=")/g) || [];
      if (options.iconFilePath) {
        writeFile(createPath(options.iconFilePath), `["${iconList.join('","')}"]`);
      }
      if (options.dts) {
        const iconDts = `export type Iconfont = "${iconList.join('"|"')}"`;
        writeFile(createPath(dtsPath), iconDts);
      }
      writeFile(createPath(options.distFilePath), URL_CONTENT);
      return [
        {
          tag: 'script',
          injectTo: 'head',
          attrs: { src: options.url },
        },
      ];
    },
  };
}
function getURL(url) {
  return /http/.test(url) ? url : `https:${url}`;
}
function isHttpsURL(url) {
  return /https/.test(url);
}

async function getURLContent(url):Promise<string> {
  const targetURL = getURL(url);
  let http;
  try {
    http = isHttpsURL(targetURL) ? await import('https') : await import('http');
  } catch (err) {
    console.log('https support is disabled!');
  }
  return new Promise((resolve, reject) => {
    http
      .get(targetURL, res => {
        let data = '';
        res.on('data', chunk => (data += chunk.toString()));
        res.on('end', () => resolve(data));
      })
      .on('error', err => {
        reject(err);
      });
  });
}
function createPath(url, metaUrl = import.meta.url) {
  return fileURLToPath(new URL(url, metaUrl));
}
