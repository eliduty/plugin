import { dirname, join, normalize } from "path";
import { promises as fs } from "fs";
import { normalizePath, type Plugin } from "vite";
interface Options {
  /**
   * iconfont url
   */
  url: string;
  /**
   * 是否生成icon类型声明文件，可以为boolean或者具体生成的路径
   */
  dts: boolean | string;
  /**
   * 自动下载iconfont到本地
   */
  distFilePath: string;
  /**
   * 自动生成iconfont图标集合
   */
  iconFilePath: string;
}

export default (options: Options): Plugin => {
  const dtsPath =
    options.dts === true ? "./iconfont.d.ts" : (options.dts as string);
  let config;
  return {
    name: "vite-plugin-iconfont",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async transformIndexHtml(_) {
      const IS_PRO = config.mode === "production";
      let url = options.url;
      const URL_CONTENT = await getURLContent(url);
      const iconList = URL_CONTENT.match(/(?<=id=").+?(?=")/g) || [];
      if (options.iconFilePath) {
        writeFile(options.iconFilePath, `["${iconList.join('","')}"]`);
      }
      if (options.dts) {
        const iconDts = `export type Iconfont = "${iconList.join('"|"')}"`;
        writeFile(dtsPath, iconDts);
      }
      if (IS_PRO) {
        const { outDir, assetsDir } = config.build;
        url = join(config.base, assetsDir, "iconfont.js")
          .split("\\")
          .join("/");
        writeFile(`${outDir}/${url}`, URL_CONTENT);
      }

      return [
        {
          tag: "script",
          injectTo: "head",
          attrs: { src: url },
        },
      ];
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
