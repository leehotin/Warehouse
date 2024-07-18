var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");
const dbName = "Warehouse_In_Out_System";

const IOemuSys = require('./../callClass/started');
//const { render } = require('../app');////這東西是誰放進來的 令我執行res.render時提醒我有循環依賴的可能
const iOemuSys = new IOemuSys();

router.get('/', checkLogin, async (req, res, next) => {
    res.redirect("/productlist");
});
router.post('/info', checkLogin, async (req, res, next) => {
    try {
        //console.log(req.body)
        await client.connect();

        const products = client.db(dbName).collection("products");
        let data = await products.aggregate([ // join table
            {
                $match: { Product_id: req.body.call_info } //找出符合條件的products
            },
            {
                $lookup: {
                    from: "stocks", //目標table
                    localField: "stock_id", // 自己的col 
                    foreignField: "_id", // 目標的col
                    as: "stocks"// 取得資料後的名稱
                }
            },
            {
                $limit: 1 //輸出數量
            }
        ]).toArray();
        let stocks = await client.db(dbName).collection("stocks").find().toArray();
        //console.log(data);
        res.render('product/info', { data: data[0], stocks: stocks});

    } finally {
        await client.close();
    }
});
router.get('/info', checkLogin, async (req, res, next) => {
    try {
        await client.connect();
        const products = client.db(dbName).collection("products");
        id = ObjectId.createFromHexString(req.query.id);
        let data = await products.aggregate([ // join table
            {
                $match: { _id: id } //找出符合條件的products
            },
            {
                $lookup: {
                    from: "stocks", //目標table
                    localField: "stock_id", // 自己的col 
                    foreignField: "_id", // 目標的col
                    as: "stocks"// 取得資料後的名稱
                }
            },
            {
                $limit: 1 //輸出數量
            }
        ]).toArray();
        //let data = await products.findOne({_id: ObjectId.createFromHexString(req.query.id)});
        console.log('a',data)
        let stocks = await client.db(dbName).collection("stocks").find().toArray();

        res.render('product/info', { data: data[0], stocks: stocks });
    } finally {
        await client.close();
    }

});

router.post('/delete', checkLogin, async (req, res, next) => {
    try {
       // async delete(inquire = '空值', setdb, target) {
        //await iOemuSys.delete('ProductList',iOemuSys.CreatedbIndex('products'),['Product_id',req.body.call_no,req.session.user_id]);
        
        let id = req.body.id;
        await iOemuSys.connect();

 
        let data =await iOemuSys.delete('ProductList',iOemuSys.CreatedbIndex('products'),['deleteprod',id,req.session.user_id]);
        console.log(data);
        res.redirect("/productlist");
    } finally {
        await iOemuSys.disconnect();
    }
});

router.post('/save', checkLogin, async (req, res, next) => {
    try {
        await client.connect();
        let productUpdata = {};
            console.log(req.body)
        if (typeof req.body._id !== "undefined" && req.body._id != "") {
            productUpdata._id = ObjectId.createFromHexString(req.body._id);
        }
        productUpdata.Product_id = req.body.Product_id;
        productUpdata.Name = req.body.Name;
        productUpdata.Type = req.body.Type;
        productUpdata.Brand = req.body.Brand;
        productUpdata.Origin = req.body.Origin;
        productUpdata.Count = req.body.Count;
        productUpdata.stock_id = ObjectId.createFromHexString(req.body.stock);
        if (!productUpdata._id) {
            productUpdata.created_at = new Date();
        }
        productUpdata.updated_at = new Date();

        const productsCollection = client.db(dbName).collection("products");
        if (productUpdata._id) {
            //update data to DB
            //find by _id
            await productsCollection.updateOne({ _id: productUpdata._id }, { $set: productUpdata });

        } else {
            //create data to DB (return data)
            //find by data.insertedId
            const result = await productsCollection.insertOne(productUpdata);
            productUpdata._id = result.insertedId;
        }
        res.redirect("/product/info?id=" + productUpdata._id);
    } catch (err) {
        console.error(err);
        //return product info get data by _id    
    } finally {
        await client.close();
    }
}).get('/create', checkLogin, async (req, res, next) => {
    try {
        await iOemuSys.connect();
        let stock = await iOemuSys.Read('倉庫', iOemuSys.CreatedbIndex('stocks'));
        let data = await iOemuSys.Read('品牌', iOemuSys.CreatedbIndex('products'), ['Brand', 1]);
        const brand = data[0].map(item => item._id);
        const origin = data[1].map(item => item.Origin);
        res.render('product/index', { brands: brand, origins: origin, stocks: stock });
    }
    finally {
        await iOemuSys.disconnect();
    }
}).post('/saveProduct', checkLogin, async (req, res, next) => {
    try {
        await iOemuSys.connect();
        if(req.body['new_Brand'])
            req.body['Brand']=req.body['new_Brand'];
        if(req.body['new_Type'])
            req.body['Type']=req.body['new_Type'];
        if(req.body['new_Origin'])
            req.body['Origin']=req.body['new_Origin'];
        delete req.body['new_Brand'];
        delete req.body['new_Type'];
        delete req.body['new_Origin'];
        req.body['stock_id'] =ObjectId.createFromHexString(req.body['stock_id']);
        let inquire = 'Product_id';
        await iOemuSys.update('newProduct',iOemuSys.CreatedbIndex('products'),req.body);
        let data = await iOemuSys.sort('資料新增',iOemuSys.CreatedbIndex('products'),iOemuSys.lookupSheet(['stocks','stock_id','_id','trans_stock_id']),['Product_id',1],req.body['Product_id']);
        res.render('productlist/index',{data:data,sort:inquire,sub:''});
    }
    finally {
        await iOemuSys.disconnect();
    }
});

async function checkLogin(req,res,next){
    if(req.session.user_id){
        //await client.connect();
        //console.log(req.session.user_id)
        //let user = await client.db(dbName).collection('users').findOne({_id: ObjectId.createFromHexString(req.session.user_id)});
        //await client.close();
       // if(user){
        return next();
        //}
    }
    return res.redirect('/user/login');
}

module.exports = router;
