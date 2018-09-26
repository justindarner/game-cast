/* eslint consistent-return:0 */

const express = require('express');
const path = require('path');
const logger = require('./logger');

const argv = require('./argv');
const port = require('./port');
const frontend = require('./middlewares/frontend');
const bodyParser = require('body-parser');
const compression = require('compression');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const isDev = process.env.NODE_ENV !== 'production';
const ngrok =
  (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel
    ? require('ngrok')
    : false;

// configure routing
app.use(compression());
app.use(bodyParser.json(), (err, req, res, next) => {
  res.status(400).send({ message: 'Unable to parse json' });
});

app.use(
  '/api/serials',
  (req, res, next) => {
    req.io = io;
    next();
  },
  require('./api/serials'),
);

app.use('/api/config', require('./api/config'));

app.use('/static', express.static(path.resolve('static')));
app.use(frontend());

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

// Start your app.
server.listen(port, host, err => {
  if (err) {
    return logger.error(err.message);
  }

  if (!ngrok) {
    logger.appStarted(port, prettyHost);
    return;
  }

  // Connect to ngrok in dev mode
  try {
    const url = ngrok.connect(port);
    logger.appStarted(port, prettyHost, url);
  } catch (e) {
    return logger.error(e);
  }
});
