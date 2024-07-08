var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");

const dbName = "Warehouse_In_Out_System";

router.get('/',checkLogin, async (req, res, next) =>{
    try{
        await client.connect();

        let search = [
          {displayName: "Delivery Id:",name: "whereData[delivery_id]",placeholder: "Delivery Id",type: "text"},
          {displayName: "Company:",name: "whereData[company]",placeholder: "Company",type: "text"},
          {displayName: "Address:",name: "whereData[address]",placeholder: "Address",type: "text"},
          {displayName: "Phone:",name: "whereData[phone]",placeholder: "Phone",type: "text"},
          {displayName: "Delivery Type:",name: "whereData[type]",placeholder: "Delivery Type",type: "text"},
          {displayName: "Delivery Check:",name: "whereData[delivery_check]",placeholder: "Delivery Check",type: "radio",data:[{display_value:"Finish",value:"1"},{display_value:"not finish",value:"0"}]},
          {displayName: "Delivery User:",name: "whereData[delivery_user]",placeholder: "Delivery User",type: "text"},
          {displayName: "Delivery At:",name: "whereData[delivery_at]",placeholder: "Delivery At",type: "text"},
        ];
       
        //where by data
        let whereData = {};

        for(let data in req.query.whereData){
          if(typeof req.query.whereData[data] !== "undefined" && req.query.whereData[data] != ""){
            if(req.query.whereData[data]==="1")
              whereData[data] = 1 ;
            else whereData[data] = req.query.whereData[data] ;
            //whereData[data] = req.query.whereData[data];
            //console.log(typeof(whereData[data]));
          }
        }

        let data = await client.db(dbName).collection("delivery_notes").find(whereData,{
          projection:{_id:1,delivery_id:1,type:1,company:1,phone:1,delivery_check:1,delivery_user:1,delivery_at:1}
        }).toArray();

        res.render('deliveryOrder/index',{ datas: data, search: search});
      }finally{
        await client.close();
      }
});

router.post('/delete',checkLogin, async (req,res,next) =>{
  try{
    let id = ObjectId.createFromHexString(req.body.delivery_id);
    await client.connect();
    let deliveryNote = await client.db(dbName).collection("delivery_notes").findOne({_id: id});
    await client.db(dbName).collection("delivery_notes").deleteOne({_id: id});
    await client.db(dbName).collection("logs").insertOne({information:"Delete deliveryNote "+deliveryNote.delivery_id,type:"delete",created_at:new Date(),updated_at:new Date()});
    res.redirect("/deliveryOrder");
  }finally{
    await client.close();
  }
});

async function checkLogin(req,res,next){
  if(req.session.user_id){
    await client.connect();
    let user = await client.db(dbName).collection('users').findOne({_id: ObjectId.createFromHexString(req.session.user_id)});
    await client.close();
    if(user){
      req.session.user_id = user._id;
      req.session.role = user.role;
      return next();
    }else{
      return res.redirect('/users/login');
    }
  }else{
    return res.redirect('/users/login');
  }
}

module.exports = router;
