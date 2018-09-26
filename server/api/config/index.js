const fs = require('fs');
const path = require('path')
const express = require('express');
const router = express.Router();

const file = path.resolve('config.json');


router.get('/', (req, res, next) => {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      return next(err);
    }
    res.json(JSON.parse(data));
  });
});

router.post('/', (req, res, next) => {
  fs.writeFile(file, req.body, (err) => {
    if (err) {
      return next(err);
    }
    res.status(201).send({ id: file });
  });
});

router.use((err, req, res, next) => {
  res.status(err.status || 500).send(err);
});

module.exports = router;
