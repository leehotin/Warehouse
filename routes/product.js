var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb'); // Import ObjectId for querying by _id

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");
const dbName = "Warehouse_In_Out_System";

const ObjectId = require('mongodb').ObjectId;

router.get('/products_rec', async (req, res, next) => {
    try {
        const { _id } = req.query; // Extract _id from query parameters
        if (!_id) {
            res.status(400).send('Missing _id ');
            return;
        }

        const client = new MongoClient(mongoUrl, { useNewUrlParser: true });
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('products'); // Replace with your actual collection name

        // Fetch product data based on _id
        const product = await collection.findOne({ _id: ObjectId(_id) });

        if (!product) {
            res.status(404).send('Product not found');
            return;
        }

        // Send the product data as JSON
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Internal server error');
    } finally {
        client.close(); // Close the MongoDB connection
    }
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
})

module.exports = router;
