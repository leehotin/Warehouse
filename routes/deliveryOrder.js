var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");

const dbName = "Warehouse_In_Out_System";

router.get('/', async (req, res, next) =>{
    try{
        await client.connect();

        //sort by data
        let sort = {
          _id: req.query.id?req.query.id:1,
        };

        let whereData = {};

        if (typeof req.query.delivery_id !== "undefined" &&req.query.delivery_id != ""){
          whereData.delivery_id = req.query.delivery_id;
        }
        if (typeof req.query.company !== "undefined" &&req.query.company != ""){
          whereData.company = req.query.company;
        }
        if (typeof req.query.address !== "undefined" &&req.query.address != ""){
          whereData.address = req.query.address;
        }
        if (typeof req.query.phone !== "undefined" &&req.query.phone != ""){
          whereData.phone = req.query.phone;
        }
        if (typeof req.query.type !== "undefined" &&req.query.type != ""){
          whereData.type = req.query.type;
        }
        if (typeof req.query.delivery_check !== "undefined" &&req.query.delivery_check != ""){
          whereData.delivery_check = req.query.delivery_check;
        }
        if (typeof req.query.delivery_user !== "undefined" &&req.query.delivery_user != ""){
          whereData.delivery_user = req.query.delivery_user;
        }
        if (typeof req.query.delivery_at !== "undefined" &&req.query.delivery_at != ""){
          whereData.delivery_at = req.query.delivery_at;
        }


        let data = await client.db(dbName).collection("delivery_notes").find(whereData,{
          sort:sort, projection:{_id:1,delivery_id:1,type:1,company:1,phone:1,delivery_check:1,delivery_user:1,delivery_at:1}
        }).toArray();

        res.render('deliveryOrder/index',{ datas: data });
      }finally{
        await client.close();
      }
});

router.post('/delete',async (req,res,next) =>{
  try{
    let id = new ObjectId(req.body.delivery_id);
    await client.connect();
    let deliveryNote = await client.db(dbName).collection("delivery_notes").find({_id: id});
    await client.db(dbName).collection("delivery_notes").deleteOne({_id: id});
    await client.db(dbName).collection("logs").insertOne({information:"Delete deliveryNote "+deliveryNote.delivery_id,type:"delete",created_at:new Date(),updated_at:new Date()});
    res.redirect("/deliveryOrder");
  }finally{
    await client.close();
  }
});

module.exports = router;
