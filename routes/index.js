var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
