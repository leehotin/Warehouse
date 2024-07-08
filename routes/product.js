var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");
const dbName = "Warehouse-In_Out_system";


router.get('/', async (req, res, next) => {
    
});

router.get('/info', async (req,res,next)=>{
    try{
        await client.connect();
        const products = client.db(dbName).collection("products");
        let data = await products.aggregate([ // join table
            {
                $match: { _id: ObjectId.createFromHexString('667cbf81ac08f2d70899ad0e')} //找出符合條件的products
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
                $limit: 1 //輸出數量
            }
        ]).toArray();
        let stocks = await client.db(dbName).collection("stocks").find().toArray();
        console.log(data);
        res.render('product/info',{data:data[0],stocks:stocks});
    }finally{
        await client.close();
    }
});

router.post('/delete',checkLogin,async (req,res,next) =>{
    try{
        let id = ObjectId.createFromHexString(req.body.id);
        await client.connect();
        let product = await client.db(dbName).collection("products").findOne({_id:id});
        product.deleted_at = new Date();
        await client.db(dbName).collection("products").replaceOne({_id:id},product);
        await client.db(dbName).collection("logs").insertOne({information:"Delete product "+product.product_id,type:"delete",created_at:new Date(),updated_at:new Date()});
        res.redirect("/product");
    }finally{
        await client.close();
    }
});


router.post('/save',async (req,res,next) =>{
    try{
        await client.connect();
        let productUpdata = {};

        if (typeof req.body._id !=="undefined" &&req.body._id !=""){
            productUpdata._id = ObjectId.createFromHexString(req.body._id);
        }
        productUpdata.Product_id = req.body.Product_id;
        try{
            await client.connect();
            const productsCollection = client.db(dbName).collection("products");
            let productUpdate = {
                // update product data based on req.body
            };
            await productsCollection.updateOne({_id: ObjectId(req.body.id)}, {$set: productUpdate});
            res.redirect("/product");
        } catch (err) {
            next(err);
        }
    });


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
