const path = require('path');
const express = require('express');
const router = express.Router();
const compression = require('compression');

module.exports = function addProdMiddlewares(options) {
  const publicPath = options.publicPath || '/';
  const outputPath = options.outputPath || path.resolve(process.cwd(), 'build');

  router.get(publicPath, express.static(outputPath));

  // compression middleware compresses your server responses which makes them
  // smaller (applies also to assets). You can read more about that technique
  // and other good practices on official Express.js docs http://mxs.is/googmy
  return [
    compression(),
    router,
    (req, res) => res.sendFile(path.resolve(outputPath, 'index.html')),
  ];
};
