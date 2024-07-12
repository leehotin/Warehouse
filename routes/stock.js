var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");

// Assuming your MongoDB database name is "Warehouse_In_Out_System"
const dbName = "Warehouse_In_Out_System";

router.get('/',checkLogin, async (req, res, next) =>{
  try{
    await client.connect();
    //darkmode checking
    let darkMode = req.session.darkmode??'white';

    //sort by data
    let sort = {
      _id: req.query.stock_id?req.query.stock_id:1,
    };
    
    //where by data
    let whereData = {};

    if (typeof req.query.name !== "undefined" &&req.query.name != ""){
      whereData.name = {};
      whereData.name.$regex = ".*"+req.query.name+".*";
    }
    if (typeof req.query.area !== "undefined" &&req.query.area != ""){
      if(req.query.area.toUpperCase() =="A1" || req.query.area.toUpperCase() =="A2" || req.query.area.toUpperCase() =="A3"){
        whereData.area = req.query.area.toUpperCase();
      }
      else res.render('stock/index',{datas:'1',sort:'1'});
    }
    whereData.deleted_at = null;
    
    let data = await client.db(dbName).collection("stocks").find(whereData,{sort:sort}).toArray();
    
    res.render('stock/index',{ datas: data, sort:sort, darkmode:darkMode });
  }finally{
    await client.close();
  }
});

// Route to get stock data
router.get('/info',checkLogin, async (req, res,next) => {
  try {
    await client.connect();
    //darkmode checking
    let darkMode = req.session.darkmode??'white';

    // Retrieve stock data based on stockId
    const stockData = await client.db(dbName).collection('stocks').findOne({_id: ObjectId.createFromHexString(req.query.stock_id)});
    // if (!stockData) {
    //     return res.status(404).json({ error: 'Stock not found' });
    //     }
    // Process stockData (e.g., display it or perform additional actions)
    // ..
  
    res.render('stock/enquiry', {stock_data: stockData, darkmode:darkMode});

    // Close the MongoDB connection
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  finally{
    await client.close(); 
  }
});

router.get('/create',checkLogin,(req,res,next)=>{
  //darkmode checking
  let darkMode = req.session.darkmode??'white';
  res.render('stock/enquiry', {stock_data: [], darkmode:darkMode});
})

router.post('/save',checkLogin, async (req,res,next) =>{
  try{
    await client.connect();
    let stock = {};

    if (typeof req.body._id !=="undefined" &&req.body._id !=""){
        stock._id = ObjectId.createFromHexString(req.body._id);
    }

    stock.stock_id = req.body.stock_id;
    stock.area = req.body.area; 
    stock.name = req.body.name;
    if(!stock._id){
      user.created_at = new Date();
    }
    user.updated_at = new Date();

    let data = {};
    if (typeof stock._id !=="undefined" && stock._id != ""){
      data = await client.db(dbName).collection("stocks").updateOne({_id: ObjectId.createFromHexString(req.body._id)}, {$set:stock});
      data._id =req.body._id;
    }else{
      data = await client.db(dbName).collection("stocks").insertOne(stock);
      data._id = data.insertedId;
    }
    
    res.redirect("/stock/info?stock_id="+data._id); 
  }finally{
    await client.close();
  }
});

router.post('/delete',checkLogin ,async (req,res,next) =>{
  try{
    let id = ObjectId.createFromHexString(req.body.stock_id);
    await client.connect();
    let stock = await client.db(dbName).collection("stocks").findOne({_id: id});
    await client.db(dbName).collection("stocks").updateOne({_id:id},{$set:{deleted_at: new Date()}});
    await client.db(dbName).collection("logs").insertOne({information: `Delete stock area: ${stock.area},name: ${stock.name}.`,type:"delete",created_at:new Date(),updated_at:new Date()});
    res.redirect("/stock");
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
      return res.redirect('/user/login');
    }
  }else{
    return res.redirect('/user/login');
  }
}

module.exports = router;