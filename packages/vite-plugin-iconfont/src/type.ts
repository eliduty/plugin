export interface Option {
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

export interface ExtendOption extends Option {
  jsonUrl: string;
  jsContent?: string;
  jsonContent?: string;
}
