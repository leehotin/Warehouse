var express = require('express');
var router = express.Router();
const {MongoClient, ObjectId} = require('mongodb'); // Import ObjectId for querying by _id

//const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");
const dbName = "Warehouse-In_Out_system";

// var ObjectId = require('mongodb').ObjectId;

// router.get('/products_rec', async (req, res, next) => {
//     try {
//         const { _id } = req.query; // Extract _id from query parameters
//         if (!(_id)) {
//             res.status(400).send('Missing _id ');

//             return;
//         }

//         //const e = new MongoClient(client, { useNewUrlParser: true });
//         await client.connect();
        
//         const db = client.db(dbName);
//         const collection = db.collection('products'); // Replace with your actual collection name
        
//         const t = new ObjectId(_id);
        
//         //Fetch product data based on _id
//         const product = await collection.findOne({ _id:t });
       
//         /*for(const i = 0 ; i <10 ; i++)
//             for(const j = 0 ; j < 10 ; j ++)
//                 console.log(i+":"+j);
//         console.log("end");*/

        
//         console.log(product);

//         if (!product) {
//             res.status(404).send('Product not found');
//             return;
//         }

//         // Send the product data as JSON
//         res.json(product);
//     } catch (error) {
//         console.error('Error fetching product:', error);
//         res.status(500).send('Internal server error');
//     } finally {
//         client.close(); // Close the MongoDB connection
//     }
// });

router.get('/info', async (req,res,next)=>{
    try{
        await client.connect();
        const products = client.db(dbName).collection("products");
        let data = await products.aggregate([ // join table
            {
                $match: { _id: new ObjectId('667cbf81ac08f2d70899ad0e')} //找出符合條件的products
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
        res.render('/product/info');
    }finally{
        await client.close();
    }
})

module.exports = router;
