var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");
const dbName = "Warehouse_In_Out_System";


router.get('/', function(req, res, next) {
  
});

router.get('/info', async(req,res,next)=>{
    try{
        await client.connect();
        const products = client.db(dbName).collection("products");
        let data = await products.aggregate([ // join table
            {
                $match: { _id: new ObjectId('667a117da384de34623892b6')} //找出符合條件的products
            },
            {
                $lookup:{
                    from:"stocks", //目標table
                    localField:"stock_id", // 自己的col 
                    foreignField:"_id", // 目標的col
                    as: "stocks"// 取得資料後的名稱
                }
            },
            {
                $project: {  //顯示格式
                    _id: 1,
                    product_id: 1,
                    name: 1,
                    count: 1,
                    stocks: 1,
                    data: {$concat:[ "$product_id" ," ","$name"]} //合併內容
                }
            },
            {
                $limit: 1 //輸出數量
            }
        ]).toArray();

        res.send({data:data});
    }finally{
        await client.close();
    }
});

router.post('/delete',async (req,res,next) =>{
    try{
        let id = new ObjectId(req.body.id);
        await client.connect();
        let product = await client.db(dbName).collection("products").find({_id:id});
        product.deleted_at = new Date();
        await client.db(dbName).collection("products").replaceOne({_id:id},product);
        await client.db(dbName).collection("logs").insertOne({information:"Delete product "+product.product_id,type:"delete",created_at:new Date(),updated_at:new Date()});
        res.redirect("/product");
    }finally{
        await client.close();
    }
});

module.exports = router;
