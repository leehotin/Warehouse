var express = require('express');
var router = express.Router();
const path = require('path');
const IOemuSys = require('./../callClass/started');
const { ObjectId } = require('mongodb');
//建構物件，其中用法看所require置入的類的位置的js檔
const iOemuSys = new IOemuSys();


router.get('/', checkLogin, async function (req, res, next) {
    try {
        //進行連線
        await iOemuSys.connect();
        req.query.sort = 1 ? 1 : -1
        let data = await iOemuSys.Read('垃圾桶', iOemuSys.CreatedbIndex('recycleBin'), ['recycleBin', req.query.sort]);
        console.log('a'+data+'b')
        res.render('recycleBin/index', { datas: data, sort: req.query.sort });
    }
    finally {
        //關閉連線
        await iOemuSys.disconnect();
    }
    //當路由是get並且傳入sort時做的處理  
}).post('/rollback', checkLogin, async function (req, res, next) {
    try {
        //進行連線
        await iOemuSys.connect();
        await iOemuSys.rollBack(iOemuSys.CreatedbIndex('recycleBin'), req.body.rollback_no);
        
        //let inquire;
        //正如上面第一個普通的get路由，這次後面要傳入一個陣列並且有三個元素，共2項資料4個元素，其中第一個是直接傳入剛宣告的，
        //如果呼叫的處理方法沒有對該項做預載參數，便會出現報錯，而後面陣列的由於已知在這邊的路由是對products做處理，所以陣列前兩個元素已知
        //而陣列第三個元素要透過get方法來取得，所以是ejs設計好的一步
        //let data = await iOemuSys.sort(inquire,['Warehouse_In_Out_System','products',req.query.seq]);
        //console.log(typeof(req.query.seq));
        //這邊的用意是，如果get方法收到的seq項回傳的值不是-1的話，把inquire的值變成傳來的sort值以進行下一個程序的ejs設計項，因為inquire已用完所以再用一下
        //res.render('productlist/index',{data:data,sort:inquire});
        res.redirect('/recycleBin');
    }
    finally {
        //關閉連線
        await iOemuSys.disconnect();
    }
}).get('/sort', checkLogin, async function (req, res, next) {
    try {
        //進行連線
        await iOemuSys.connect();
    }
    finally {
        //關閉連線
        await iOemuSys.disconnect();
    }
    //以post方法傳入要delete的東東(預計想設計一個垃圾桶，可以操作先把東西過冷河放入垃圾桶，然後多一個垃圾桶介面放九屎垃圾，並且可以實行dropCollection處理XD)  
}).post('/delete', checkLogin, async function (req, res, next) {
    try {
        //進行連線
        await iOemuSys.connect();
        await iOemuSys.remove();
    }
    finally {
        //關閉連線
        await iOemuSys.disconnect();
    }
});

async function checkLogin(req, res, next) {
    if (req.session.user_id) {

            return next();
        } 
     else {
        return res.redirect('/user/login');
    }
}

module.exports = router;
