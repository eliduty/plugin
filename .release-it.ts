export default {
  git: {
    commitMessage: 'chore: release v${version}',
    requireCleanWorkingDir: false,
    tagAnnotation: 'chore(release): ${version}'
  },
  github: {
    release: true,
    comments: {
      submit: true
    }
  },
  npm: {
    skipChecks: true
  },
  plugins: {
    '@release-it/conventional-changelog': {
      infile: 'docs/CHANGELOG.md',
      header: '更新日志',
      preset: {
        name: 'conventionalcommits',
        types: [
          {
            type: 'feat',
            section: '新功能'
          },
          {
            type: 'fix',
            section: 'Bug修复'
          }
        ]
      }
    }
  }
};
