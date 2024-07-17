var express = require('express');
var router = express.Router();
const path = require('path');
const IOemuSys = require('./../callClass/started');
const { ObjectId } = require('mongodb');
//建構物件，其中用法看所require置入的類的位置的js檔
const iOemuSys = new IOemuSys();

router.get('/',checkLogin,async function(req, res, next) {
    try{
        //進行連線
        await iOemuSys.connect();
        //宣告變數存在，其實可以直接傳入想要的東西
        console.log(req.session.role)
        let inquire;
        //呼叫物件裡的方法
        let data = await iOemuSys.sort('資料排序',iOemuSys.CreatedbIndex('products'),iOemuSys.lookupSheet(['stocks', 'stock_id', '_id', 'trans_stock_id']),[,1]);
        console.log(data);
        res.render('productlist/index',{data:data,sort:inquire,sub:''});
    }
    finally{
        //關閉連線
        await iOemuSys.disconnect();
    }
    //當路由是get並且傳入sort時做的處理  
}).get('/sort',checkLogin,async function(req, res, next) {
    try{
        //進行連線
        await iOemuSys.connect();
        //宣告變數存在
        let sort;
        if(req.query.seq==="1")
            req.query.seq = 1 ;
        else req.query.seq = -1 ;
        let data = await iOemuSys.sort('資料排序',iOemuSys.CreatedbIndex('products'),iOemuSys.lookupSheet(['stocks', 'stock_id', '_id', 'trans_stock_id']),[req.query.sort,req.query.seq]);        
        //這邊的用意是，如果get方法收到的seq項回傳的值不是-1的話，把inquire的值變成傳來的sort值以進行下一個程序的ejs設計項，因為inquire已用完所以再用一下
        if(req.query.seq!=-1)
            sort = req.query.sort ;
        //傳到對應路徑的ejs做處理，其中應該會抓到一大把data資料，會在ejs那邊處理，
        //而sort的值看inquire有沒有改寫，主要影響當相同項目已進行倒排序時要讓接下來的ejs產出順排序的ejs相同項目
        res.render('productlist/index',{data:data,sort:sort,sub:''});
    }
    finally{
        //關閉連線
        await iOemuSys.disconnect();
    }
    //以post方法傳入要delete的東東(預計想設計一個垃圾桶，可以操作先把東西過冷河放入垃圾桶，然後多一個垃圾桶介面放九屎垃圾，並且可以實行dropCollection處理XD)  
}).get('/title',checkLogin,async function(req, res, next) {
    try{
        //進行連線
        await iOemuSys.connect();
        //宣告變數存在
        let inquire;
        if(req.query.seq==="1")
            req.query.seq = 1 ;
        else req.query.seq = -1 ;
        let data = await iOemuSys.sort('產品分類',iOemuSys.CreatedbIndex('products'),iOemuSys.lookupSheet(['stocks','stock_id','_id','trans_stock_id']),[req.query.sort,req.query.seq],req.query.title);
        //這邊的用意是，如果get方法收到的seq項回傳的值不是-1的話，把inquire的值變成傳來的sort值以進行下一個程序的ejs設計項，因為inquire已用完所以再用一下
        if(req.query.seq!=-1){
            inquire = req.query.sort ;
        }
        let sub = 'use' ;
        //傳到對應路徑的ejs做處理，其中應該會抓到一大把data資料，會在ejs那邊處理，
        //而sort的值看inquire有沒有改寫，主要影響當相同項目已進行倒排序時要讓接下來的ejs產出順排序的ejs相同項目
        res.render('productlist/index',{data:data,sort:inquire,sub:sub});
    }
    finally{
        //關閉連線
        await iOemuSys.disconnect();
    }
    //以post方法傳入要delete的東東(預計想設計一個垃圾桶，可以操作先把東西過冷河放入垃圾桶，然後多一個垃圾桶介面放九屎垃圾，並且可以實行dropCollection處理XD)  
}).get('/check',checkLogin,async function(req, res, next) {
    try{
        //進行連線
        await iOemuSys.connect();
        let inquire ;
        let data = await iOemuSys.sort('資料排序',iOemuSys.CreatedbIndex('products'),iOemuSys.lookupSheet(['stocks', 'stock_id', '_id', 'trans_stock_id']),['Product_id',1],req.query.match);
        
        //let data = await iOemuSys.Read('products',iOemuSys.CreatedbIndex('products'),['Product_id',req.query.match]);
        console.log(data);
        res.render('productlist/index',{data:data,sort:inquire,sub:''});
    }
    finally{
        //關閉連線
        await iOemuSys.disconnect();
    }
    //以post方法傳入要delete的東東(預計想設計一個垃圾桶，可以操作先把東西過冷河放入垃圾桶，然後多一個垃圾桶介面放九屎垃圾，並且可以實行dropCollection處理XD)  
}).post('/delete',checkLogin,async function(req, res, next) {
    try{
        //進行連線
        await iOemuSys.connect();
        console.log(req.session.user_id)
        await iOemuSys.delete('ProductList',iOemuSys.CreatedbIndex('products'),['Product_id',req.body.call_no,req.session.user_id]);
        //return res.render('productlist/cooldown');
        return res.redirect('/productlist')
    }
    finally{
        //關閉連線
        await iOemuSys.disconnect();
    }
    //創建新貨單有用到這個layout
}).get('/layout',checkLogin,async function(req, res, next) {
    try{
        await iOemuSys.connect();
        let search ;
        if(req.query.search!='' && typeof(req.query.search)=='string'){
            search = req.query.search ;
        search = req.query.search.replace(/-\d+$/,'');
        search = search.charAt(0).toUpperCase() + search.slice(1);
        console.log('aaaa')
        }
        console.log('b:',search) ;
        let data = await iOemuSys.search('查詢並響應',iOemuSys.CreatedbIndex(req.query.Name),[req.query.group,search,req.query.limit]);
        return res.json(data);
    }
    finally{
        //關閉連線
        await iOemuSys.disconnect();
    }
});
async function checkLogin(req,res,next){
    if(req.session.user_id){
      /*await iOemuSys.connect();
      let user = await iOemuSys.Read('userData',iOemuSys.CreatedbIndex('users'),['_id', ObjectId.createFromHexString(req.session.user_id)]);
      await iOemuSys.disconnect();
      if(user){
        req.session.user_id = user._id;
        req.session.role = user.role;*/
        return next();
      }else
        return res.redirect('/user/login');
      

  }


module.exports = router;
