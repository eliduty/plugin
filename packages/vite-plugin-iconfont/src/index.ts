import { existsSync, promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse } from 'node:url';
import { type IndexHtmlTransformResult, type Plugin } from 'vite';
import X2JS from 'x2js';
// iconfont使用的是相对协议，如果没有指定协议默认使用https
const DEFAULT_PROTOCOL = 'https';

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
  jsSharking?: boolean;
  /**
   * 指定图标集合进行打包
   */
  pickIconList?: string[];
}

interface ExtendOption extends Option {
  jsonUrl: string;
  jsContent?: string;
  jsonContent?: string;
}

export const defaultOptions: Option = {
  url: '',
  distUrl: '',
  inject: true,
  dts: false,
  iconJson: false,
  prefix: 'icon',
  prefixDelimiter: '-',
  jsSharking: true
};

export const matchIconRegExp = /(?<=id=").+?(?=")/g;

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
      const iconJsonPath = opt.iconJson !== true ? opt.iconJson : index ? `iconfont${index}.json` : 'iconfont.json';
      JSON_CONTENT = opt?.pickIconList?.length ? getSharkingJson(JSON_CONTENT, opt?.pickIconList) : JSON_CONTENT;
      generateFile(iconJsonPath, JSON_CONTENT);
    }

    // 生成ts类型声明文件
    if (opt.dts) {
      const iconList = JS_CONTENT.match(matchIconRegExp) ?? [];
      const dtsPath = opt.dts !== true ? opt.dts : index ? `iconfont${index}.d.ts` : 'iconfont.d.ts';
      const iconDts = `declare type Iconfont = "${iconList.join('"|"')}"`;
      generateFile(dtsPath, iconDts);
    }

    // 生成iconify.json
    if (opt.iconifyFile) {
      const parser = new X2JS();
      const iconXML = JS_CONTENT.match(/<svg>.*<\/svg>/i) + '';
      const iconfontObj: any = parser.xml2js(iconXML) || {};
      const iconfontSymbols = iconfontObj?.svg?.symbol || [];
      const iconifyJson = createIconifyJson(iconfontSymbols, opt.prefix!, opt.prefixDelimiter);
      const iconifyJsonString = JSON.stringify(iconifyJson);
      const iconifyPath = opt.iconifyFile !== true ? opt.iconifyFile : index ? `iconfont${index}.iconify.json` : 'iconfont.iconify.json';
      generateFile(iconifyPath, iconifyJsonString);
    }

    // 自动下载iconfont symbol js
    if (!opt.inject) {
      // 不自动注入 iconfont js，打包指定icon
      JS_CONTENT = opt?.pickIconList?.length ? getSharkingJs(JS_CONTENT, opt?.pickIconList) : JS_CONTENT;
      const distUrl = opt.distUrl ? opt.distUrl : index ? `iconfont${index}.js` : 'iconfont.js';
      generateFile(getDistPath(distUrl), JS_CONTENT);
    }
  });

  let config: any;
  const packIconList: string[][] = [];

  return {
    name: 'vite-plugin-iconfont',
    async configResolved(resolvedConfig) {
      config = resolvedConfig;
      const IS_DEV = config.mode === 'development';

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
            !packIconList?.[index]?.length ? (packIconList[index] = [item]) : packIconList[index].push(item);
          }
        });
      });
    },
    generateBundle: () => {
      options.forEach((opt, index) => {
        if (opt.inject) {
          const { outDir, assetsDir } = config.build;

          const JS_CONTENT = opt.pickIconList?.length ? getSharkingJs(urlContent[opt.url], opt.pickIconList) : opt.jsSharking ? getSharkingJs(urlContent[opt.url], packIconList[index]) : urlContent[opt.url];
          const distUrl = opt.distUrl ? opt.distUrl : index ? `iconfont${index}.js` : 'iconfont.js';
          // 匹配使用的到icon
          const distPath = getDistPath(join(config.base, outDir, assetsDir, distUrl));
          generateFile(distPath, JS_CONTENT);
        }
      });
    }
  };
};

/**
 * 验证每一项配置中是否包含url参数
 * @param opt
 * @returns
 */
function validate(opt: Option[]) {
  if (!opt.length) return false;
  return opt.every(item => item.url);
}

/**
 * 合并参数配置
 * @param options
 */
function mergeOption(option: Option | Option[]) {
  const type = typeOf(option);
  if (!['Object', 'Array'].includes(type)) {
    throw new Error(`【vite-plugin-iconfont】 unsupported parameter type`);
  }
  const optionList = Array.isArray(option) ? option : [option];
  const res: ExtendOption[] = optionList.map(item => ({ ...defaultOptions, ...item, jsonUrl: item?.url?.replace('.js', '.json') }));
  return res;
}

/**
 * 获取值类型
 * @param value
 * @returns
 */
function typeOf(value: unknown) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

/**
 * 获取地址，如果是相对协议地址自动添加https
 * @param url
 * @returns
 */
function getURL(url: string) {
  return /^http/.test(url) ? url : `https:${url}`;
}

/**
 * 获取请求协议
 * @param url url地址，默认为https
 * @returns
 */
function getProtocolType(url: string) {
  const { protocol } = parse(url);
  return protocol || DEFAULT_PROTOCOL;
}

/**
 * 获取http client
 * @param protocolType
 * @returns
 */
async function getHttpClient(url: string) {
  const protocolType = getProtocolType(url);
  let http;
  try {
    http = protocolType === DEFAULT_PROTOCOL ? await import('https') : await import('http');
  } catch (err) {
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
async function generateFile(filepath: string, content: string) {
  const originalContent = existsSync(filepath) ? await fs.readFile(filepath, 'utf-8') : '';
  originalContent !== content && writeFile(filepath, content);
}
/**
 * 获取指定url地址的内容
 * @param url
 * @returns
 */
async function getURLContent(url: string): Promise<string> {
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
async function writeFile(filePath: string, content = '') {
  await fs.mkdir(dirname(filePath), { recursive: true });
  return await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 批量获取url地址内容
 * @param urls url列表
 * @returns
 */
async function getUrlsContent(urls: string[]) {
  const request = urls.map(getURLContent);
  return Promise.all(request);
}

/**
 * 对ICON js进行摇树优化
 * @param svgIconString
 * @param iconList
 * @returns
 */
function getSharkingJs(svgIconString: string, iconList: string[]) {
  const reg = new RegExp(`<symbol\\s+(?=[^>]*id="(${iconList.join('|')})")[^>]*>[\\s\\S]*?<\\/symbol>`, 'g');
  const res = svgIconString.match(reg);
  // 如果匹配到有内容就，使用过滤后的内容
  res?.length && (svgIconString = svgIconString.replace(/<svg\b[^>]*>(.*?)<\/svg>/gi, `<svg>${res?.join('')}</svg>`));
  return svgIconString;
}

/**
 * 对ICON json进行摇树优化
 * @param jsonString
 * @param iconList
 * @returns
 */
function getSharkingJson(jsonString: string, iconList: string[]) {
  const data = JSON.parse(jsonString);
  data.glyphs = data.glyphs?.filter((item: { name: string }) => iconList.includes(`${data.css_prefix_text}${item.name}`));
  return JSON.stringify(data);
}

/**
 * 获取输出到本地的路径
 * @param path
 */
function getDistPath(path: string) {
  return join(process.cwd(), path).split('\\').join('/');
}

type Path = {
  _d: string;
};
type IconfontSymbol = {
  _id: string;
  path: Path | Path[];
  _viewBox: string;
};
type IconItem = {
  body: string;
  width: number;
  height: number;
  left: number;
  top: number;
};
/**
 * 生成icon图标内容
 * @param iconPathJson
 * @param prefix
 */
function createIconifyItem(iconPathJson: IconfontSymbol, prefix: string, prefixDelimiter: string) {
  const reg = new RegExp(`^${prefix}${prefixDelimiter}`, 'i');
  const name = iconPathJson._id.replace(reg, '');
  const path = Array.isArray(iconPathJson?.path) ? iconPathJson?.path : [iconPathJson?.path];
  const body = path.reduce((temp, item) => {
    temp += `<path d="${item._d}" fill="currentColor"/>`;
    return temp;
  }, '');
  const [left, top, width, height] = iconPathJson._viewBox.split(' ').map(Number);
  return {
    name,
    body,
    left,
    top,
    width,
    height
  };
}
/**
 * 生成iconifyJSON
 * @param iconfontSymbols
 * @param prefix
 * @param prefixDelimiter
 */
function createIconifyJson(iconfontSymbols: IconfontSymbol[], prefix: string, prefixDelimiter = '-') {
  const icons = iconfontSymbols.reduce(
    (temp, item) => {
      const iconify = createIconifyItem(item, prefix, prefixDelimiter);
      const { name, body, width, height, left, top } = iconify;
      temp[name] = { body, width, height, left, top };
      return temp;
    },
    {} as Record<string, IconItem>
  );
  return {
    prefix,
    icons
  };
}
