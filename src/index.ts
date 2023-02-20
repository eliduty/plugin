import { dirname, join } from "path";
import { promises as fs } from "fs";
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

  let config;
  return {
    name: "vite-plugin-iconfont",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async transformIndexHtml() {
      const injectArr: IndexHtmlTransformResult = [];
      const IS_DEV = config.mode === "development";
      let url = opt.url;

      const URL_CONTENT = await getURLContent(url);
      const iconList = URL_CONTENT.match(/(?<=id=").+?(?=")/g) || [];

      // 生成下载图标配置
      if (opt.iconJson) {
        const JSON_CONTENT = await getURLContent(url.replace(".js", ".json"));
        const iconJsonPath =
          opt.iconJson !== true ? opt.iconJson : "iconfont.json";
        writeFile(iconJsonPath, JSON_CONTENT);
      }

      // 生成ts类型声明文件
      if (opt.dts) {
        const dtsPath = options.dts !== true ? options.dts : "iconfont.d.ts";
        const iconDts = `declare type Iconfont = "${iconList.join('"|"')}"`;
        writeFile(dtsPath as string, iconDts);
      }

      // 自动下载iconfont symbol js
      if (!opt.inject) {
        writeFile(join(process.cwd(), opt.distUrl as string), URL_CONTENT);
      } else {
        if (!IS_DEV) {
          const { outDir, assetsDir } = config.build;
          url = join(config.base, assetsDir, opt.distUrl || "")
            .split("\\")
            .join("/");
          writeFile(`${outDir}/${url}`, URL_CONTENT);
        }
        injectArr.push({
          tag: "script",
          injectTo: "head",
          attrs: { src: url },
        });
      }
      return injectArr;
    },
  };
};
function getURL(url) {
  return /http/.test(url) ? url : `https:${url}`;
}
function isHttpsURL(url) {
  return /https/.test(url);
}

async function writeFile(filePath: string, content = "") {
  await fs.mkdir(dirname(filePath), { recursive: true });
  return await fs.writeFile(filePath, content, "utf-8");
}

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
