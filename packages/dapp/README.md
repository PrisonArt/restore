# dapp

## localhost testing
Terminal 5

```bash
yarn dapp:start
```

## Bundle Analyzer

```bash
npm install -g webpack-bundle-analyzer
yarn dapp:build
webpack-bundle-analyzer ./packages/dapp/dist/pr1s0nart-angular/stats.json
```

visit `http://127.0.0.1:8888/`

## Fleek Setup

### Install Fleek App on PrisonArt GitHub

[Configuration on GitHub](https://github.com/PrisonArt/restore/settings/installations)

## Fleek Site Setup

Login to Fleek with GitHub account

### Add New Site

* Select PrisonArt -> Restore repository
* Production Branch: `main`
* Hosting Service: `IPFS`
* Docker Image Name: `node:lts`
* Build command: `npm install && npm run build:prod`
* Publish directory: `dist/pr1s0nart-angular`
Base directory: `packages/dapp/`

### Code updates
When new code is checked into the main branch, Fleek will automagically redeploy.
