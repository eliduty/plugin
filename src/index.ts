import { dirname, join } from "node:path";
import { existsSync, promises as fs } from "node:fs";
import { IndexHtmlTransformResult, type Plugin } from "vite";

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
}

export default (options: Options): Plugin => {
  const opt: Options = Object.assign(
    {
      url: "",
      distUrl: "iconfont.js",
      inject: true,
      dts: false,
      iconJson: false,
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
      let url = opt.url;

      const URL_CONTENT = await getURLContent(url);
      const iconList = URL_CONTENT.match(/(?<=id=").+?(?=")/g) || [];

      // 生成下载图标配置
      if (opt.iconJson) {
        const JSON_CONTENT = await getURLContent(url.replace(".js", ".json"));
        const iconJsonPath =
          opt.iconJson !== true ? opt.iconJson : "iconfont.json";
        generateFile(iconJsonPath, JSON_CONTENT);
      }

      // 生成ts类型声明文件
      if (opt.dts) {
        const dtsPath = options.dts !== true ? options.dts : "iconfont.d.ts";
        const iconDts = `declare type Iconfont = "${iconList.join('"|"')}"`;
        generateFile(dtsPath as string, iconDts);
      }

      // 自动下载iconfont symbol js
      if (!opt.inject) {
        generateFile(join(process.cwd(), opt.distUrl as string), URL_CONTENT);
      } else {
        if (!IS_DEV) {
          const { outDir, assetsDir } = config.build;
          url = join(config.base, assetsDir, opt.distUrl || "")
            .split("\\")
            .join("/");
          generateFile(`${outDir}/${url}`, URL_CONTENT);
        }
        injectArr.push({
          tag: "script",
          injectTo: "head",
          attrs: { src: url },
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
  return /http/.test(url) ? url : `https:${url}`;
}

/**
 * 判断是否是https地址
 * @param url
 * @returns
 */
function isHttpsURL(url) {
  return /https/.test(url);
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
 * 获取指定url地址的内容
 * @param url
 * @returns
 */
async function getURLContent(url): Promise<string> {
  const targetURL = getURL(url);
  let http;
  try {
    http = isHttpsURL(targetURL) ? await import("https") : await import("http");
  } catch (err) {
    console.log("https support is disabled!");
  }
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
