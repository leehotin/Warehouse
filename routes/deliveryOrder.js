var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");

router.get('/', async (req, res, next) =>{
    try{
        await client.connect();
        let data = await client.db("Warehouse_In_Out_system").collection("delivery_notes").find().toArray();
        
        res.render('deliveryOrder/index',{ datas: data });
      }finally{
        await client.close();
      }
});

module.exports = router;
