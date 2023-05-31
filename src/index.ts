/// @1ts-nocheck
import { dirname, join } from "node:path";
import { existsSync, promises as fs } from "node:fs";
import { parse } from "node:url";
import { IndexHtmlTransformResult, type Plugin } from "vite";
import X2JS from "x2js";

// iconfont使用的是相对协议，如果没有指定协议默认使用https
const DEFAULT_PROTOCOL = "https";

interface Options {
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
  iconifyFile?: string;
}

export default (options: Options): Plugin => {
  const opt: Options = Object.assign(
    {
      url: "",
      distUrl: "iconfont.js",
      inject: true,
      dts: false,
      iconJson: false,
      prefix: "icon",
      prefixDelimiter: "-"
    },
    options
  );

  if (!opt.url) {
    throw new Error(
      `【vite-plugin-iconfont】 options url parameter is required`
    );
  }

  const injectArr: IndexHtmlTransformResult = [];
  return {
    name: "vite-plugin-iconfont",
    async configResolved(config) {
      const IS_DEV = config.mode === "development";
      let JS_URL = opt.url;
      const JSON_URL = JS_URL.replace(".js", ".json");
      const [JS_CONTENT, JSON_CONTENT] = await getUrlsContent([JS_URL, JSON_URL]);

      // 生成下载图标配置
      if (opt.iconJson) {
        const iconJsonPath =
          opt.iconJson !== true ? opt.iconJson : "iconfont.json";
        generateFile(iconJsonPath, JSON_CONTENT);
      }

      // 生成ts类型声明文件
      if (opt.dts) {
        const iconList = JS_CONTENT.match(/(?<=id=").+?(?=")/g) || [];
        const dtsPath = options.dts !== true ? options.dts : "iconfont.d.ts";
        const iconDts = `declare type Iconfont = "${iconList.join('"|"')}"`;
        generateFile(dtsPath as string, iconDts);
      }

      // 生成iconify.json
      if (opt.iconifyFile) {
        const parser = new X2JS();
        const iconXML = JS_CONTENT.match(/<svg>.*<\/svg>/i) + "";
        const iconfontObj: any = parser.xml2js(iconXML) || {};
        const iconfontSymbols = iconfontObj?.svg?.symbol || [];
        const iconifyJson = createIconifyJson(
          iconfontSymbols,
          opt.prefix!,
          opt.prefixDelimiter,
        );
        try {
          const iconifyJsonString = JSON.stringify(iconifyJson);
          generateFile(opt.iconifyFile, iconifyJsonString);
        } catch (error) {
          console.log("create IconifyJson error!");
        }
      }
      // 自动下载iconfont symbol js
      if (!opt.inject) {
        generateFile(join(process.cwd(), opt.distUrl as string), JS_CONTENT);
      } else {
        if (!IS_DEV) {
          const { outDir, assetsDir } = config.build;
          JS_URL = join(config.base, assetsDir, opt.distUrl || "")
            .split("\\")
            .join("/");
          generateFile(`${outDir}/${JS_URL}`, JS_CONTENT);
        }
        injectArr.push({
          tag: "script",
          injectTo: "head",
          attrs: { src: JS_URL },
        });
      }
    },
    transformIndexHtml: () => injectArr,
  };
};

/**
 * 获取地址，如果是相对协议地址自动添加https
 * @param url
 * @returns
 */
function getURL(url) {
  return /^http/.test(url) ? url : `https:${url}`;
}

/**
 * 获取请求协议
 * @param url url地址，默认为https
 * @returns
 */
function getProtocolType(url) {
  const { protocol } = parse(url);
  return protocol || DEFAULT_PROTOCOL;
}

/**
 * 获取http client
 * @param protocolType
 * @returns
 */
async function getHttpClient(url) {
  const protocolType = getProtocolType(url);
  let http;
  try {
    http =
      protocolType === DEFAULT_PROTOCOL
        ? await import("https")
        : await import("http");
  } catch (err) {
    console.log("get http(s) client error!");
  }
  return http;
}

/**
 * 生成文件
 * @param path
 * @param content
 */
async function generateFile(filepath, content) {
  const originalContent = existsSync(filepath)
    ? await fs.readFile(filepath, "utf-8")
    : "";
  originalContent !== content && writeFile(filepath, content);
}
/**
 * 获取指定url地址的内容
 * @param url
 * @returns
 */
async function getURLContent(url): Promise<string> {
  const targetURL = getURL(url);
  const http = await getHttpClient(url);
  return new Promise((resolve, reject) => {
    http
      .get(targetURL, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk.toString()));
        res.on("end", () => resolve(data));
      })
      .on("error", (err) => {
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
async function writeFile(filePath: string, content = "") {
  await fs.mkdir(dirname(filePath), { recursive: true });
  return await fs.writeFile(filePath, content, "utf-8");
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
function createIconifyItem(
  iconPathJson: IconfontSymbol,
  prefix: string,
  prefixDelimiter: string
) {
  const reg = new RegExp(`^${prefix}${prefixDelimiter}`, "i");
  const name = iconPathJson._id.replace(reg, "");
  const path = Array.isArray(iconPathJson?.path)
    ? iconPathJson?.path
    : [iconPathJson?.path];
  const body = path.reduce((temp, item) => {
    temp += `<path d="${item._d}" fill="currentColor"/>`;
    return temp;
  }, "");
  const [left, top, width, height] = iconPathJson._viewBox
    .split(" ")
    .map(Number);
  return {
    name,
    body,
    left,
    top,
    width,
    height,
  };
}
/**
 * 生成iconifyJSON
 * @param iconfontSymbols
 * @param prefix
 * @param prefixDelimiter
 */
function createIconifyJson(
  iconfontSymbols: IconfontSymbol[],
  prefix: string,
  prefixDelimiter = "-",
) {
  const icons = iconfontSymbols.reduce((temp, item) => {
    const iconify = createIconifyItem(item, prefix, prefixDelimiter);
    const { name, body, width, height, left, top } = iconify;
    temp[name] = { body, width, height, left, top };
    return temp;
  }, {} as Record<string, IconItem>);
  return {
    prefix,
    icons,
  };
}
