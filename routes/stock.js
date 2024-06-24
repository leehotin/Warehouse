var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");

// Assuming your MongoDB database name is "Warehouse_In_Out_System"
const dbName = "Warehouse_In_Out_System";

router.get('/', async (req, res, next) =>{
  try{
    await client.connect();
    let data = await client.db(dbName).collection("stocks").find().toArray();

    res.render('stock/index',{ datas: data });
  }finally{
    await client.close();
  }
});

module.exports = router;
