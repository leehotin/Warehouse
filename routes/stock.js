var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");

// Assuming your MongoDB database name is "Warehouse_In_Out_System"
const dbName = "Warehouse_In_Out_System";

router.get('/', async (req, res, next) =>{
  try{
    await client.connect();

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
    }
    
    let data = await client.db(dbName).collection("stocks").find(whereData,{sort:sort}).toArray();
    
    res.render('stock/index',{ datas: data, sort:sort });
  }finally{
    await client.close();
  }
});

// Route to get stock data
router.get('/info', async (req, res,next) => {
  try {
    await client.connect();

    // Retrieve stock data based on stockId
    const stockData = await client.db(dbName).collection('stocks').findOne({_id: ObjectId.createFromHexString(req.query.stock_id)});
    // if (!stockData) {
    //     return res.status(404).json({ error: 'Stock not found' });
    //     }
    // Process stockData (e.g., display it or perform additional actions)
    // ..
  
    res.render('stock/enquiry', {stock_data: stockData});

    // Close the MongoDB connection
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  finally{
    await client.close(); 
  }
});

router.get('/create',(req,res,next)=>{
  res.render('stock/enquiry', {stock_data: []});
})

router.post('/save', async (req,res,next) =>{
  try{
    await client.connect();
    let stock = {};

    if (typeof req.body._id !=="undefined" &&req.body._id !=""){
        stock._id = ObjectId.createFromHexString(req.body._id);
    }

    stock.stock_id = req.body.stock_id;
    stock.area = req.body.area; 
    stock.name = req.body.name;
    
    let data = {};
    if (typeof stock._id !=="undefined" && stock._id != ""){
      data = await client.db(dbName).collection("stocks").replaceOne({_id: ObjectId.createFromHexString(req.body._id)}, stock);
      data = await client.db(dbName).collection("stocks").findOne({_id:ObjectId.createFromHexString(req.body._id)});
    }else{
      data = await client.db(dbName).collection("stocks").insertOne(stock);
      data = await client.db(dbName).collection("stocks").findOne({_id:data.insertedId});
    }
    
    res.redirect("/stock/info?stock_id="+data._id); 
  }finally{
    await client.close();
  }
});

router.post('/delete',async (req,res,next) =>{
  try{
    let id = ObjectId.createFromHexString(req.body.stock_id);
    await client.connect();
    let stock = await client.db(dbName).collection("stocks").findOne({_id: id});
    await client.db(dbName).collection("stocks").deleteOne({_id: id});
    await client.db(dbName).collection("logs").insertOne({information: `Delete stock area: ${stock.area},name: ${stock.name}.`,type:"delete",created_at:new Date(),updated_at:new Date()});
    res.redirect("/stock");
  }finally{
    await client.close();
  }
});
module.exports = router;