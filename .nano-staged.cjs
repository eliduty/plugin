module.exports = {
  '*.{html,vue}': ['eslint --fix', 'stylelint --fix', 'prettier --write'],
  '*.{js,ts,tsx,jsx,cjs,mjs}': ['eslint --fix', 'prettier --write'],
  '*.{css}': ['stylelint --fix', 'prettier --write']
};
