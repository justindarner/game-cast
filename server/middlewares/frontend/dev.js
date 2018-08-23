const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

function createWebpackMiddleware(compiler, publicPath) {
  return webpackDevMiddleware(compiler, {
    logLevel: 'warn',
    publicPath,
    stats: 'errors-only',
  });
}

module.exports = function addDevMiddlewares(webpackConfig) {
  const compiler = webpack(webpackConfig);
  const middleware = createWebpackMiddleware(
    compiler,
    webpackConfig.output.publicPath,
  );
  return [
    middleware,
    webpackHotMiddleware(compiler),
    (req, res) => {
      fs.readFile(path.join(compiler.outputPath, 'index.html'), (err, file) => {
        if (err) {
          res.sendStatus(404);
          return;
        }
        res.send(file.toString());
      });
    },
  ];
};
