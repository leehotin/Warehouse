var express = require('express');
var router = express.Router();

const IOemuSys = require('./../callClass/started');
const iOemuSys = new IOemuSys();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");

const dbName = "Warehouse_In_Out_System";

router.get('/', checkLogin, async (req, res, next) => {
  try {
    await client.connect();

    let search = [
      { displayName: "貨單編號:", name: "whereData[delivery_id]", placeholder: "貨單編號", type: "text" },
      { displayName: "公司名稱:", name: "whereData[company]", placeholder: "公司名稱", type: "text" },
      { displayName: "公司地址:", name: "whereData[address]", placeholder: "公司地址", type: "text" },
      { displayName: "公司電話:", name: "whereData[phone]", placeholder: "公司電話", type: "text" },
      { displayName: "貨單類型:", name: "whereData[type]", placeholder: "貨單類型", type: "radio", data: [{ display_value: "入貨單", value: "in" }, { display_value: "出貨單", value: "out" }] },
      { displayName: "是否已經完成:", name: "whereData[delivery_check]", placeholder: "是否已經完成", type: "radio", data: [{ display_value: "已完成", value: "1" }, { display_value: "未完成", value: "0" }] },
      { displayName: "確認貨單員工:", name: "whereData[delivery_user]", placeholder: "確認貨單員工", type: "text" },
      { displayName: "完成日期:", name: "whereData[delivery_at]", placeholder: "完成日期", type: "date" },
    ];

    //where by data
    let whereData = {};

    for (let data in req.query.whereData) {
      if (typeof req.query.whereData[data] !== "undefined" && req.query.whereData[data] != "") {
        switch (data) {
          case "delivery_at":
            let minDate = new Date(req.query.whereData[data]), maxDate = new Date(req.query.whereData[data]);
            maxDate.setDate(maxDate.getDate() + 1);
            whereData[data] = {};
            whereData[data].$gte = minDate;
            whereData[data].$lt = maxDate;
            break;
          default:
            whereData[data] = {};
            whereData[data].$regex = ".*" + req.query.whereData[data] + ".*";
        }
      }
    }
    console.log('');
    //console.log(whereData); 
    let data = await client.db(dbName).collection("delivery_notes").find(whereData, {
      projection: { _id: 1, delivery_id: 1, company: 1, type: 1, phone: 1, delivery_check: 1, delivery_user: 1, delivery_at: 1 }
    }).toArray();

    res.render('deliveryOrder/index', { datas: data, search: search });
  } finally {
    await client.close();
  }
});

router.post('/delete', checkLogin, async (req, res, next) => {
  try {
    let id = ObjectId.createFromHexString(req.body.delivery_id);
    await client.connect();
    let deliveryNote = await client.db(dbName).collection("delivery_notes").findOne({ _id: id });
    await client.db(dbName).collection("delivery_notes").updateOne({ _id: id }, { $set: { deleted_at: new Date() } });
    await client.db(dbName).collection("logs").insertOne({ information: "Delete deliveryNote " + deliveryNote.delivery_id, type: "delete", created_at: new Date(), updated_at: new Date() });
    res.redirect("/deliveryOrder");
  } finally {
    await client.close();
  }
}).get('/info', checkLogin, async (req, res, next) => {
  try {
    await iOemuSys.connect();
    let data = await iOemuSys.Read('deliveryOrderInfo', iOemuSys.CreatedbIndex('delivery_notes'), ['delivery_id', req.query.delivery_id]);
    if(data ==null){
      data = '' ;
    }
    console.log(data);
    let list = await iOemuSys.Read('productList', iOemuSys.CreatedbIndex('products'), ['productsList', 1])
    if (list == null){
      list = '';
    }
    console.log('bbb',list)
    let use //= await iOemuSys.Read('使用者列表', iOemuSys.CreatedbIndex('users'), ['username', 1]);
    if(use == null)
      use = '';
    console.log('use:',use)
    await res.render('deliveryOrder/info', { datas: data, user: use, lists: list });
  } finally {
    await iOemuSys.disconnect();
  }
}).get('/create', checkLogin, async (req, res, next) => {
  try {
    await iOemuSys.connect();
    //req.session.user_id=ObjectId.createFromHexString(req.session.user_id);
    let data = await iOemuSys.Read('貨品列表', iOemuSys.CreatedbIndex('products'), ['productsList', 1]);
    if (req.session.user_id != '' && req.session.user_id != undefined)
      req.session.user_id = ObjectId.createFromHexString(req.session.user_id);
    let use = await iOemuSys.Read('', iOemuSys.CreatedbIndex('users'), ['_id', req.session.user_id]);
    res.render('deliveryOrder/create', { datas: data, user: use });
  }
  finally {
    await iOemuSys.disconnect();
  }
}).post('/create', checkLogin, async (req, res, next) => {
  try {
    await iOemuSys.connect();
    let items = [];
    delete req.body.type;
    if (req.body.Type === "in") {
      req.body.delivery_id = "INV" + req.body.delivery_id;
      req.body.type = 'in';
    }
    else {
      req.body.delivery_id = "TRF" + req.body.delivery_id;
      req.body.type = 'out';
    }
    let data = await iOemuSys.Read('checkOrderExists', iOemuSys.CreatedbIndex('delivery_notes'), ['delivery_id', req.body.delivery_id]);
    console.log('data:', data)
    if (data === null) {
      console.log('abc',req.body)
      if (typeof (req.body.count) != 'string') {
        for (i in req.body.count) {
          req.body.count[i] = isNaN(parseInt(req.body.count[i], 10)) ? 0 : parseInt(req.body.count[i], 10);
        }
      } else {
        req.body.count = isNaN(parseInt(req.body.count, 10)) ? 0 : parseInt(req.body.count, 10);
      }
      if (typeof (req.body.completed) != 'string') {
        for (i in req.body.completed) {
          req.body.completed[i] = isNaN(parseInt(req.body.completed[i], 10)) ? 0 : parseInt(req.body.completed[i], 10);
        }
      } else {
        req.body.completed = isNaN(parseInt(req.body.completed, 10)) ? 0 : parseInt(req.body.completed, 10);
      }

      if (req.body.stock_id != '' && typeof (req.body.stock_id) != 'string') {
        for (i in req.body.stock_id) {
          req.body.stock_id[i] = ObjectId.createFromHexString(req.body.stock_id[i]);
        }
      }
      else if (req.body.stock_id != '') {
        req.body.stock_id = ObjectId.createFromHexString(req.body.stock_id);
      }
      //console.log(typeof(req.body.product_id))
      if (typeof (req.body.product_id) != 'string' && req.body.product_id != '') {
        for (let i in req.body.count) {
          items.push({
            product_id: req.body.product_id[i],
            name: req.body.name[i],
            count: req.body.count[i],
            completed: req.body.completed[i],
            stock_id: req.body.stock_id[i]
          });
        }
      }
      else {
        items.push({
          product_id: req.body.product_id,
          name: req.body.name,
          count: req.body.count,
          completed: req.body.completed,
          stock_id: req.body.stock_id
        });
      }
      req.body.created_at = new Date();
      data = {
        delivery_id: req.body.delivery_id,
        company: req.body.company,
        address: req.body.address,
        phone: req.body.phone,
        items,
        type: req.body.type,
        delivery_user: req.body.delivery_user,
        created_at: req.body.created_at
      }
      console.log("items:",items)
      console.log('data',data);
      delete displayDelivery_user;

      console.log("why", req.body)
      let result = await iOemuSys.update('createDeliveryOrder', iOemuSys.CreatedbIndex('delivery_notes'), data);
      console.log("end", result);
      ///////}
      res.redirect('/deliveryOrder');
    }
  }
  /*catch {
    res.redirect('/');
  }*/
  finally {
    await iOemuSys.disconnect();
  }
}).post('/update', checkLogin, async (req, res, next) => {
  try {
    await iOemuSys.connect();
    let search = [
      { displayName: "貨單編號:", name: "whereData[delivery_id]", placeholder: "貨單編號", type: "text" },
      { displayName: "公司名稱:", name: "whereData[company]", placeholder: "公司名稱", type: "text" },
      { displayName: "公司地址:", name: "whereData[address]", placeholder: "公司地址", type: "text" },
      { displayName: "公司電話:", name: "whereData[phone]", placeholder: "公司電話", type: "text" },
      { displayName: "貨單類型:", name: "whereData[type]", placeholder: "貨單類型", type: "radio", data: [{ display_value: "入貨單", value: "in" }, { display_value: "出貨單", value: "out" }] },
      { displayName: "是否已經完成:", name: "whereData[delivery_check]", placeholder: "是否已經完成", type: "radio", data: [{ display_value: "已完成", value: "1" }, { display_value: "未完成", value: "0" }] },
      { displayName: "確認貨單員工:", name: "whereData[delivery_user]", placeholder: "確認貨單員工", type: "text" },
      { displayName: "完成日期:", name: "whereData[delivery_at]", placeholder: "完成日期", type: "date" },
    ];
    console.log(req.body)
    //await iOemuSys.update('updateDeliveryOrder', iOemuSys.CreatedbIndex('delivery_notes'),req.body) ;
    //let data = [await iOemuSys.Read('deliveryOrderInfo', iOemuSys.CreatedbIndex('delivery_notes'),['delivery_id',req.body['delivery_id']])];
    //console.log(data)
    //res.render('deliveryOrder/index',{ datas: data, search: search});

  } finally {
    await iOemuSys.disconnect();
  }
});

async function checkLogin(req, res, next) {
  if (req.session.user_id) {
    await client.connect();
    let user = await client.db(dbName).collection('users').findOne({ _id: ObjectId.createFromHexString(req.session.user_id) });
    await client.close();
    if (user) {
      req.session.role = user.role;
      return next();
    }
  }
  return res.redirect('/user/login');
}

module.exports = router;
