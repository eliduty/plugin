import { existsSync, promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { URL } from 'node:url';
import { DEFAULT_PROTOCOL, defaultOptions } from './config';
import type { ExtendOption, Option } from './type';

/**
 * 验证每一项配置中是否包含url参数
 * @param opt
 * @returns
 */
export function validate(opt: Option[]) {
  if (!opt.length) return false;
  return opt.every(item => item.url);
}

/**
 * 合并参数配置
 * @param options
 */
export function mergeOption(option: Option | Option[]) {
  const type = typeOf(option);
  if (!['Object', 'Array'].includes(type)) {
    throw new Error(`【vite-plugin-iconfont】 unsupported parameter type`);
  }
  const optionList = Array.isArray(option) ? option : [option];
  const res: ExtendOption[] = optionList.map(item => ({
    ...defaultOptions,
    ...item,
    jsonUrl: item?.url?.replace('.js', '.json')
  }));
  return res;
}

/**
 * 获取值类型
 * @param value
 * @returns
 */
export function typeOf(value: unknown) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

/**
 * 获取地址，如果是相对协议地址自动添加https
 * @param url
 * @returns
 */
export function getURL(url: string) {
  return /^http/.test(url) ? url : `https:${url}`;
}

/**
 * 获取请求协议
 * @param url url地址，默认为https
 * @returns
 */
export function getProtocolType(url: string) {
  const reg = /^(http|https)/;
  if (!reg.test(url)) return DEFAULT_PROTOCOL;

  const { protocol } = new URL(url);
  return protocol.slice(0, -1) || DEFAULT_PROTOCOL;
}

/**
 * 获取http client
 * @param protocolType
 * @returns
 */
export async function getHttpClient(url: string) {
  const protocolType = getProtocolType(url);
  let http;
  try {
    http = protocolType === DEFAULT_PROTOCOL ? await import('https') : await import('http');
  } catch {
    // eslint-disable-next-line no-console
    console.log('get http(s) client error!');
  }
  return http;
}

/**
 * 对比生成文件
 * @param path
 * @param content
 */
export async function generateFile(filepath: string, content: string) {
  const originalContent = existsSync(filepath) ? await fs.readFile(filepath, 'utf-8') : '';
  originalContent !== content && writeFile(filepath, content);
}
/**
 * 获取指定url地址的内容
 * @param url
 * @returns
 */
export async function getURLContent(url: string): Promise<string> {
  const targetURL = getURL(url);
  const http = await getHttpClient(url);
  return new Promise((resolve, reject) => {
    http
      ?.get(targetURL, res => {
        let data = '';
        res.on('data', chunk => (data += chunk.toString()));
        res.on('end', () => resolve(data));
      })
      .on('error', err => {
        reject(err);
      });
  });
}

/**
 * 写文件
 * @param filePath
 * @param content
 * @returns
 */
export async function writeFile(filePath: string, content = '') {
  await fs.mkdir(dirname(filePath), { recursive: true });
  return await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 批量获取url地址内容
 * @param urls url列表
 * @returns
 */
export function getUrlsContent(urls: string[]) {
  const request = urls.map(getURLContent);
  return Promise.all(request);
}

/**
 * 对ICON js进行摇树优化
 * @param svgIconString
 * @param iconList
 * @returns
 */
export function getShakingJs(svgIconString: string, iconList: string[] = []) {
  const reg = new RegExp(
    `<symbol\\s+(?=[^>]*id="(${iconList.join('|')})")[^>]*>[\\s\\S]*?<\\/symbol>`,
    'g'
  );
  const res = svgIconString.match(reg);
  // 如果匹配到有内容就，使用过滤后的内容
  res?.length &&
    (svgIconString = svgIconString.replace(
      /<svg\b[^>]*>(.*?)<\/svg>/gi,
      `<svg>${res?.join('')}</svg>`
    ));
  return svgIconString;
}

/**
 * 对ICON json进行摇树优化
 * @param jsonString
 * @param iconList
 * @returns
 */
export function getShakingJson(jsonString: string, iconList: string[] = []) {
  const data = JSON.parse(jsonString);
  data.glyphs = data.glyphs?.filter((item: { name: string }) =>
    iconList.includes(`${data.css_prefix_text}${item.name}`)
  );
  return JSON.stringify(data);
}

/**
 * 规范化路径
 * @param path
 */
export function normalizePath(path: string) {
  return path.split('\\').join('/');
}
