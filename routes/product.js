var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");
const dbName = "Warehouse_In_Out_System";


router.get('/', async (req, res, next) => {
    
});
router.post('/info', async (req,res,next)=>{
    try{
        console.log(req.body.call_info)
        await client.connect();
        const products = client.db(dbName).collection("products");
        let data = await products.aggregate([ // join table
            {
                $match: { Product_id:req.body.call_info} //找出符合條件的products
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
        await client.db(dbName).collection("products").updateOne({_id:id},{$set:{deleted_at: new Date()}});
        await client.db(dbName).collection("logs").insertOne({information:"Delete product "+product.product_id,type:"delete",created_at:new Date(),updated_at:new Date()});
        res.redirect("/productlist");
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
        productUpdata.Name = req.body.Name;
        productUpdata.Type = req.body.Type;
        productUpdata.Brand = req.body.Brand;
        productUpdata.Origin = req.body.Origin;
        productUpdata.Count = req.body.Count;
        productUpdata.stock_id = req.body.stock_id;
        if(!productUpdata._id){
            productUpdata.created_at = new Date();
        }
        productUpdata.updated_at = new Date();
       
        const productsCollection = client.db(dbName).collection("products");
        if(productUpdata._id){
            await productsCollection.updateOne({ _id: productUpdata._id }, { $set: productUpdata });
        } else {
            //update data to DB
            //find by _id
            const result = await productsCollection.insertOne(productUpdata);
            productUpdata._id = result.insertedId;
        }
            //create data to DB (return data)
            //find by data.insertedId
            res.redirect("/product/info?id=" + productUpdata._id.toHexString());
        } catch (err) {
            console.error(err);
        //return product info get data by _id    
               next(err);
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
