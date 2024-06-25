var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");

const dbName = "Warehouse_In_Out_System";

router.get('/', async (req, res, next) =>{
    try{
        await client.connect();

        //sort by data
        let sort = {};

        let data = await client.db(dbName).collection("delivery_notes").find({},{
          projection:{_id:1,delivery_id:1,type:1,company:1,phone:1,delivery_check:1,delivery_user:1,delivery_at:1}
        }).toArray();

        res.render('deliveryOrder/index',{ datas: data });
      }finally{
        await client.close();
      }
});

module.exports = router;
