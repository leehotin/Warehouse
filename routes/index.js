var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");

// Assuming your MongoDB database name is "Warehouse_In_Out_System"
const dbName = "Warehouse_In_Out_System";

router.get('/', async (req, res, next)=> {
  try{
    await client.connect();
    let darkmode = req.session.darkmode??'white';
    console.log(req.session);
    //reset output
    let data = {};

    //get today
    let start = new Date(), end = new Date();
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    //get data from DB
    let todayOrder = await client.db(dbName).collection('delivery_notes').find({created_at:{$gte:start,$lte:end}}, {projection:{_id:0,delivery_id:1,type:1,company:1}}).toArray();
    let notFinish = await client.db(dbName).collection('delivery_notes').find({delivery_at:null,delivery_check:"0"}, {projection:{_id:0,delivery_id:1,type:1,company:1}}).toArray();
    
    //set return data
    data.todayOrders = todayOrder;
    data.notFinishs = notFinish;

    res.render('index',{datas:data,darkmode:darkmode});
  }finally{
    await client.close();
  }
}).get('/download', function(req, res, next) {
  const file = '0.rar';
  res.download(file); // Set disposition and send it.
  //res.render('0.rar');
});

router.get('/darkmode', async (req,res,next)=>{
  if(await req.session.darkmode == 'white'){
    await req.session.darkmode == 'dark';
  }else{
    await req.session.darkmode == 'white';
  }
  
  res.redirect('/');
})
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
      return res.redirect('/user/login');
    }
  }else{
    return res.redirect('/user/login');
  }
}

module.exports = router;
