import type { Option } from './type';
/**
 * 默认配置
 */
export const defaultOptions: Option = {
  url: '',
  distUrl: '',
  inject: true,
  dts: false,
  iconJson: false,
  prefix: 'icon',
  prefixDelimiter: '-',
  jsShaking: true
};
/**
 * iconfont使用的是相对协议，如果没有指定协议默认使用https
 */
export const DEFAULT_PROTOCOL = 'https';

/**
 * 匹配图标正则
 */
export const matchIconRegExp = /(?<=id=").+?(?=")/g;
