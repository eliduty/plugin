module.exports = {
  'pre-commit': 'npx nano-staged',
  'commit-msg': 'npx tsx scripts/lint-commit.ts'
};
