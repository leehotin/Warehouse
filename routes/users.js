var express = require('express');
var router = express.Router();
const Crypto = require('crypto');
const hash = Crypto.createHash('sha512');
const IOemuSys = require('./../callClass/started');
const iOemuSys = new IOemuSys();
//console.log(hash.update('123456').digest('hex'));
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");

// Assuming your MongoDB database name is "Warehouse_In_Out_System"
const dbName = "Warehouse_In_Out_System";

/* GET users listing. */
router.get('/',checkLogin, async (req, res, next)=>{
  //list  
  try{
    await client.connect();
    const roles = [
      {
        display_name: "管理員",
        value: "0"
      },
      {
        display_name: "使用者",
        value: "1"
      },
    ]

    let header = req.query.role??'使用者/管理員'
    let whereData = {};

    if (typeof req.query.user_id !== "undefined" &&req.query.user_id != ""){
      whereData.user_id = {}
      whereData.user_id.$regex = ".*"+req.query.user_id+".*";
    }
    if (typeof req.query.name !== "undefined" &&req.query.name != ""){
      whereData.name = req.query.name;
    }
    if (typeof req.query.role !== "undefined" &&req.query.role != ""){
      whereData.role = req.query.role;
      switch(req.query.role){
        case "0":
          header = "管理員";
          break;
        case "1":
          header = "使用者";
          break;
      }

    }
    whereData.deleted_at = null;
    let data = await client.db(dbName).collection('users').find(whereData).toArray();

    res.render('user/index',{datas:data,roles: roles,header:header});
  }finally{
    await client.close();
  }
});

router.get('/info/:id',checkLogin, async (req, res, next)=>{
  // read user info
  try{
    await client.connect();

    let data = await client.db(dbName).collection('users').findOne({_id: ObjectId.createFromHexString(req.params.id)});
    const roles = [
      {
        display_name: "管理員",
        value: "0"
      },
      {
        display_name: "使用者",
        value: "1"
      },
    ]

    let message = "";
    if(req.session.message){
      message = req.session.message;
    }
    req.session.message = null;

    res.render('user/info',{data:data,roles:roles,message:message});
  }finally{
    await client.close();
  }
});

router.get('/create',checkLogin, (req, res, next)=>{
  // create user info
  const roles = [
    {
      display_name: "管理員",
      value: "0"
    },
    {
      display_name: "使用者",
      value: "1"
    },
  ]

  let message = "";
  if(req.session.message){
    message = req.session.message;
  }
  req.session.message = null;

  res.render('user/info',{data:[],roles:roles,message:message});

});

router.get('/login', (req,res,next) => {
  let errorMessage = '';
  if(req.session.errorMessage){
    errorMessage = req.session.errorMessage
  }
  req.session.errorMessage = null;

  res.render('user/login',{errorMessage: errorMessage});
});

router.post('/login', async(req,res,next)=>{
  try{
    await client.connect();
    let user ,pw = has(req.body.password);
    console.log(pw);
    const query = {
      username: { $regex: new RegExp(req.body.username, 'i') },password:pw,
      $expr: {
        $eq: [{ $strLenCP: "$username" }, req.body.username.length]
      }
    };
    user = await client.db(dbName).collection('users').countDocuments(query);
    switch (user) {
      case 1:
        user = await client.db(dbName).collection('users').findOne({ username: { '$regex': req.body.username, '$options': 'i' } });
          req.session.user_id = user._id;
          req.session.role = user.role;
          console.log(req.session);
          res.redirect('/');
        break;
      case (user > 1):
        req.session.errorMessage = '使用者錯誤，請通知管理員更正';
        res.redirect('/user/login');
        break;
      default:
        req.session.errorMessage = '帳戶或密碼錯誤';
        res.redirect('/user/login');
    }
    /*if(user>1){
      req.session.errorMessage = '使用者錯誤，請通知管理員更正';
      res.redirect('/user/login');
    }
    else if(user===0){
      req.session.errorMessage = 'username or password error';
      res.redirect('/user/login');
    }
    else {
      user = await client.db(dbName).collection('users').findOne({username:{'$regex':req.body.username,'$options':'i'}});
      if(pw===user.password){
        req.session.user_id = user._id;
        req.session.role = user.role;
        res.redirect('/');
      }
      else {
        req.session.errorMessage = 'username or password error';
        res.redirect('/user/login');
      }
    }*/
    console.log("取得使用者的資料：")
    console.log(user);

 
  }finally{
    await client.close();
  }
});

router.post('/logout',checkLogin, (req,res,next)=>{
  req.session.destroy(() => {
    console.log('user logout');
  })
  res.redirect("/user/login");
});

router.post('/save',checkLogin, async (req,res,next)=>{
  //update or create user
  try{
    await client.connect();
    let user = {};

    if (typeof req.body.id !=="undefined" &&req.body.id !=""){
        user._id = ObjectId.createFromHexString(req.body.id);
    }

    user.user_id = req.body.user_id??'';
    user.username = req.body.username;
    if (typeof req.body.password !=="undefined" && req.body.password !="" && typeof req.body.confirm_password !=="undefined" && req.body.confirm_password !=""){
      if(req.body.password === req.body.confirm_password && req.body.password.length <17 && req.body.confirm_password.length <17){
        user.password = has(req.body.password);
        //user.password = req.body.password;
      }
    }
    user.name = req.body.name??'';
    user.role = req.body.role??'1'; 
    if(!user._id){
      user.created_at = new Date();
    }
    user.updated_at = new Date();

    let data = {};
    if (typeof user._id !=="undefined" && user._id != ""){
      //update user
      //check DB username is unique
      checkUser = await client.db(dbName).collection("users").find({_id:{$ne:user._id},username:user.username}).toArray();
      if(checkUser.length == 0){
        data = await client.db(dbName).collection("users").updateOne({_id: ObjectId.createFromHexString(req.body.id)},{$set:user});
        data._id = req.body.id;
      }else{
        req.session.message = "更新帳戶出現錯誤";
        return res.redirect(`/user/info/${user._id}`);
      }
    }else{
      //create user
      if(user.password && user.username){
        //check DB username is unique
        checkUser = await client.db(dbName).collection("users").find({username:user.username}).toArray();
        if(checkUser.length == 0){
          data = await client.db(dbName).collection("users").insertOne(user);
          await client.db(dbName).collection("logs").insertOne({information: `Create user: ${user.user_id},name: ${user.name},role: ${user.role}.`,type:"create",created_at:new Date(),updated_at:new Date()});
          data._id = data.insertedId;
        }else{
          req.session.message = "帳戶名稱已經存在";
          return res.redirect('/user/create');
        } 
      }else{
        req.session.message = "建立帳戶出現錯誤";
        return res.redirect('/user/create');
      }
    }

    res.redirect(`/user/info/${data._id}`);
  }finally{
    await client.close();
  }
});

router.post('/delete',checkLogin,async (req,res,next) =>{
  try{
    let id = ObjectId.createFromHexString(req.body.user_id);
    await client.connect();
    let user = await client.db(dbName).collection("users").findOne({_id: id});
    await client.db(dbName).collection("users").updateOne({_id:id},{$set:{deleted_at: new Date()}});
    await client.db(dbName).collection("logs").insertOne({information: `Delete user: ${user.user_id},name: ${user.name},role: ${user.role}.`,type:"delete",created_at:new Date(),updated_at:new Date()});
    res.redirect("/user");
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
function has(pword){
  //let pw  ;
  let pw ="'" + Crypto.createHash('sha256').update(pword).digest('base64') + "'";
  return pw ;
}

module.exports = router;
