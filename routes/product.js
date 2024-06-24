var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
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
                $lookup:{
                    from:"stocks", //目標table
                    localField:"stock_id", // 自己的col 
                    foreignField:"_id", // 目標的col
                    as: "stocks"// 取得資料後的名稱
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
})

module.exports = router;
