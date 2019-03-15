module.exports = {
  setupFilesAfterEnv: [
    require.resolve('./setupTests.js'),
  ],
  moduleFileExtensions: ['js', 'json', 'node', 'ts'],
  rootDir: process.cwd(),
  roots: ['<rootDir>/packages'],
  collectCoverageFrom: ['packages/**/*.js'],
  setupFiles: [
    require.resolve('./setupEnvironment.js'),
    require.resolve('./setupHostConfigs.js'),
  ],
};
