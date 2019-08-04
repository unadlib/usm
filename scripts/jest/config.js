module.exports = {
  setupFilesAfterEnv: [
    require.resolve('./setupTests.js'),
  ],
  moduleFileExtensions: ['js', 'json', 'node', 'ts'],
  rootDir: process.cwd(),
  roots: ['<rootDir>/packages'],
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
  ],
  setupFiles: [
    require.resolve('./setupEnvironment.js'),
    require.resolve('./setupHostConfigs.js'),
  ],
};
