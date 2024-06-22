var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");

router.get('/', async (req, res, next) =>{
  try{
    await client.connect();
    let data = await client.db("Warehouse_In_Out_system").collection("stocks").find().toArray();

    res.render('stock/index',{ datas: data });
  }finally{
    await client.close();
  }
});

router.get('/', function(req, res, next) {
    let id = req.query.stock_id;  
    // server on
    // use stock_table mongoDB to lookup stock_id
    // find by stock_id
    // display data
    // server close
    stock_
});

module.exports = router;
