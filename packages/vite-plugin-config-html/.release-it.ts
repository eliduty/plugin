export default {
  git: {
    commitMessage: 'chore: release vite-plugin-config-html v${version}',
    tag: false,
    requireCleanWorkingDir: false
  },
  github: {
    release: false
  },
  hooks: {
    'before:init': 'pnpm build'
  },
  npm: {
    skipChecks: true
  }
};
