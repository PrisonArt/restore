const packageJson = require('../../package.json');

export const environment = {
  appName: 'Restore',
  envName: 'TEST',
  chainId: '1337',
  network: 'unknown',
  graphURL: 'http://localhost:8000/subgraphs/name/pr1s0nart/pr1s0nart-subgraph-localhost',
  wsRpcUri: 'http://localhost:8545',
  infuraProjectId: 'a02a728083ce4ac2bc2a6a30d8b730f4',
  production: false,
  test: true,
  i18nPrefix: '',
  versions: {
    app: packageJson.version,
    angular: packageJson.dependencies['@angular/core'],
    ngrx: packageJson.dependencies['@ngrx/store'],
    material: packageJson.dependencies['@angular/material'],
    bootstrap: packageJson.dependencies.bootstrap,
    rxjs: packageJson.dependencies.rxjs,
    ngxtranslate: packageJson.dependencies['@ngx-translate/core'],
    fontAwesome:
      packageJson.dependencies['@fortawesome/fontawesome-free-webfonts'],
    angularCli: packageJson.devDependencies['@angular/cli'],
    typescript: packageJson.devDependencies['typescript'],
    cypress: packageJson.devDependencies['cypress'],
    eslint: packageJson.devDependencies['eslint']
  }
};
