export default {
  git: {
    commitMessage: 'chore: release vite-plugin-sourcemap-upload v${version}',
    tag: false,
    requireCleanWorkingDir: false
  },
  github: {
    release: false
  },
  hooks: {
    'before:init': 'pnpm build'
  }
};
