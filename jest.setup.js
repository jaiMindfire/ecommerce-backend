const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = './'; // This will be your baseUrl from tsconfig
tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});
