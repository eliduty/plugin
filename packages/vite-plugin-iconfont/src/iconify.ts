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
export function createIconifyItem(iconPathJson: IconfontSymbol, prefix: string, prefixDelimiter: string) {
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
export function createIconifyJson(iconfontSymbols: IconfontSymbol[], prefix: string, prefixDelimiter = '-') {
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
