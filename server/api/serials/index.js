/** eslint-disable no-unused-vars */
const express = require('express');
const router = express.Router();
const { get, map } = require('lodash');

const SerialPort = require('serialport');
const TagLengthValue = require('./protocols/TagLengthValue');

let port;

const TAGS = ['NES'];

router.get('/', (req, res, next) => {
  const portName = get(port, 'path', false);
  SerialPort.list()
    .then(serials =>
      res.send(
        map(serials, serial => ({
          ...serial,
          connected: serial.comName === portName,
        })),
      ),
    )
    .catch(next);
});

router.get('/connected', (req, res) => {
  if (!port) {
    res.status(200).send({ connected: false });
    return;
  }
  res.status(200).send({
    ...port,
    connected: true,
  });
});

router.post('/connect', (req, res, next) => {
  const { comName } = req.body;

  if (port) {
    port.close();
    port = undefined;
  }
  port = new SerialPort(comName, { autoOpen: false });
  port.pipe(new TagLengthValue());
  port.on('data', data => {
    req.io.emit('buttons', {
      tag: TAGS[data[0]],
      length: data[1] + 0,
      value: data[data[1] + 1] + 0,
    });
  });

  port.open(err => {
    if (err) {
      next({
        ...err,
      });
      return;
    }
    res.status(204).send();
  });
});

router.post('/disconnect', (req, res, next) => {
  if (port) {
    port.close();
    port = undefined;
  }
  res.status(204).send();
});

router.use((err, req, res, next) => {
  res.status(err.status || 500).send(err);
});

module.exports = router;
