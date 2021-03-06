const packageJson = require('../../package.json');

export const environment = {
  appName: 'Restore',
  envName: 'PROD',
  chainId: '1',
  network: 'homestead',
  graphURL: 'https://api.studio.thegraph.com/query/24825/pr1s0nart/0.0.1',
  wsRpcUri: 'https://mainnet.infura.io/v3/a02a728083ce4ac2bc2a6a30d8b730f4',
  etherscanURL: 'https://etherscan.io',
  infuraProjectId: 'a02a728083ce4ac2bc2a6a30d8b730f4',
  production: true,
  test: false,
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
