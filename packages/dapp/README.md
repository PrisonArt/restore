# localhost testing

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
