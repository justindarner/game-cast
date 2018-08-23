/* eslint-disable global-require */
const path = require('path');

/**
 * Front-end middleware
 */
module.exports = () => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const addProdMiddlewares = require('./prod');
    return addProdMiddlewares({
      outputPath: path.resolve(process.cwd(), 'build'),
      publicPath: '/',
    });
  }
  const webpackConfig = require(path.resolve(
    'internals/webpack/webpack.dev.babel',
  ));
  const addDevMiddlewares = require('./dev');
  return addDevMiddlewares(webpackConfig);
};
