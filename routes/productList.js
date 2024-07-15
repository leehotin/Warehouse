var express = require('express');
var router = express.Router();
const path = require('path');
const IOemuSys = require('./../callClass/started');
const { ObjectId } = require('mongodb');
//建構物件，其中用法看所require置入的類的位置的js檔
const iOemuSys = new IOemuSys();

router.get('/',async function(req, res, next) {
    try{
        //進行連線
        await iOemuSys.connect();
        //宣告變數存在，其實可以直接傳入想要的東西
        let inquire;
        //呼叫物件裡的方法
        let data = await iOemuSys.sort('資料排序',iOemuSys.CreatedbIndex('products'),iOemuSys.lookupSheet(['stocks', 'stock_id', '_id', 'trans_stock_id']),[,1]);
        res.render('productlist/index',{data:data,sort:inquire,sub:''});
    }
    finally{
        //關閉連線
        await iOemuSys.disconnect();
    }
    //當路由是get並且傳入sort時做的處理  
}).get('/sort',async function(req, res, next) {
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
}).get('/title',async function(req, res, next) {
    try{
        //進行連線
        //darkmode checking
        await iOemuSys.connect();
        //宣告變數存在
        let inquire;
        //正如上面第一個普通的get路由，這次後面要傳入一個陣列並且有三個元素，共2項資料4個元素，其中第一個是直接傳入剛宣告的，
        //如果呼叫的處理方法沒有對該項做預載參數，便會出現報錯，而後面陣列的由於已知在這邊的路由是對products做處理，所以陣列前兩個元素已知
        //而陣列第三個元素要透過get方法來取得，所以是ejs設計好的一步
        //let data = await iOemuSys.sort(inquire,['Warehouse_In_Out_System','products',req.query.seq]);
        if(req.query.seq==="1")
            req.query.seq = 1 ;
        else req.query.seq = -1 ;
        let data = await iOemuSys.sort('產品分類',iOemuSys.CreatedbIndex('products'),iOemuSys.lookupSheet(['stocks','stock_id','_id','trans_stock_id']),[req.query.sort,req.query.seq],req.query.title);
        /*let data = await iOemuSys.sort(
            ['Warehouse_In_Out_System',   //   dbName|
            'products',req.query.seq],                  //collectionName|
            'stock_id',                  //matchCol|
            '',//data[x].stock_id,            //targetValue|
            'stocks',                    //fromValue|
            'stock_id',                  //localMatch|
            '_id',                       //targetMatch|
            'trans_stock_id',             //setSelector|
            req.query.sort                       //inquire
                                              //...ele
        );*/
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
}).get('/check',async function(req, res, next) {
    try{
        //進行連線
        await iOemuSys.connect();
        let data = await iOemuSys.Read('products',iOemuSys.CreatedbIndex('products'),['Product_id',req.query.match]);
        console.log(data)
                          

    }
    finally{
        //關閉連線
        await iOemuSys.disconnect();
    }
    //以post方法傳入要delete的東東(預計想設計一個垃圾桶，可以操作先把東西過冷河放入垃圾桶，然後多一個垃圾桶介面放九屎垃圾，並且可以實行dropCollection處理XD)  
}).post('/delete',async function(req, res, next) {
    try{
        //進行連線
        await iOemuSys.connect();
        console.log(req.session.user_id)
        await iOemuSys.delete('ProductList',iOemuSys.CreatedbIndex('products'),['Product_id',req.body.call_no,req.session.user_id]);
        //delete(dbName='Warehouse_In_Out_System' ,collectionName='products', target)
        //以下沒有得到想要的結果，所以可能要再問一下Wong Sir
        //await iOemuSys.delete('Warehouse_In_Out_System','products',['Product_id',req.body.call_no]);
        /*res.writeHead(200,{
            'Content-Type': 'text/event-stream',//
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'//
        });
        res.flushHeaders();*/
        //令i有一個初值等於0
        let i = 0 ;
        //把setInterval的值存到t裡，之後要進行clearInterval時需要用到這個值
        let t = await setInterval(()=>{
            //由於無法一直對前端渲染，所以只好在後在亂叫
            console.log('將於' + i + '秒後返回列表~');
            //流程控制用
            i++;
            //當i是5時會把setInterval停掉
            if(i==5){   
                clearInterval(t);
                //並且重定向到productlist
                return res.redirect('/productlist');
            }
            //每1000ms執行一次
        },1000);
    }
    finally{
        //關閉連線
        await iOemuSys.disconnect();
    }
}).get('/layout',async function(req, res, next) {
    try{
        await iOemuSys.connect();
        let data = await iOemuSys.search('查詢並響應',iOemuSys.CreatedbIndex(req.query.Name),[req.query.group,req.query.search,req.query.limit]);
        return res.json(data);
    }
    finally{
        //關閉連線
        await iOemuSys.disconnect();
    }
});


module.exports = router;
