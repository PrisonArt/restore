const path = require('path');

// looks like in the latest import version of ipfs-http-client,
// we don't need to explicitly specify those node modules bellow
module.exports = {
  resolve: {
    fallback: {
      child_process: false,
      fs: false,
      crypto: false,
      http: false,
      https: false,
      path: false,
      os: false,
      stream: false,
      buffer: false
    },
  }
};
