// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration production` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

const packageJson = require('../../package.json');

export const environment = {
  appName: 'Restore',
  envName: 'DEV',
  chainId: '4',
  network: 'rinkeby',
  graphURL: 'https://api.studio.thegraph.com/query/24825/pr1s0nart-rinkeby/0.0.1', // FIXME
  wsRpcUri: 'https://rinkeby.infura.io/v3/a02a728083ce4ac2bc2a6a30d8b730f4', // FIXME
  etherscanURL: 'https://rinkeby.etherscan.io',
  infuraProjectId: 'a02a728083ce4ac2bc2a6a30d8b730f4',
  production: false,
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
    fontAwesome: packageJson.dependencies['@fortawesome/fontawesome-free'],
    angularCli: packageJson.devDependencies['@angular/cli'],
    typescript: packageJson.devDependencies['typescript'],
    cypress: packageJson.devDependencies['cypress'],
    eslint: packageJson.devDependencies['eslint']
  }
};
