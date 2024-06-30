var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const client = new MongoClient("mongodb://localhost:27017/");

// Assuming your MongoDB database name is "Warehouse_In_Out_System"
const dbName = "Warehouse_In_Out_System";

/* GET users listing. */
router.get('/', async (req, res, next)=>{
  //list  
  try{
    await client.connect();

    let whereData = {};

    if (typeof req.query.user_id !== "undefined" &&req.query.user_id != ""){
      whereData.user_id = req.query.user_id;
    }
    if (typeof req.query.name !== "undefined" &&req.query.name != ""){
      whereData.name = req.query.name;
    }
    if (typeof req.query.role !== "undefined" &&req.query.role != ""){
      whereData.role = req.query.role;
    }

    let data = await client.db(dbName).collection('users').find(whereData).toArray();

    console.log(data);

    res.render('user/index',{datas:data});
  }finally{
    await client.close();
  }
});

router.get('/info/:id', async (req, res, next)=>{
  // read user info
  try{
    await client.connect();
    let data = await client.db(dbName).collection('users').findOne({_id: new ObjectId(req.params.id)});
    const roles = [
      {
        display_name: "Admin",
        value: "0"
      },
      {
        display_name: "User",
        value: "1"
      },
    ]
    console.log('check:',data);
    res.render('user/info',{data:data,roles:roles});
  }finally{
    await client.close();
  }
});

router.get('/create', async (req, res, next)=>{
  // create user info
  const roles = [
    {
      display_name: "Admin",
      value: "0"
    },
    {
      display_name: "user",
      value: "1"
    },
  ]

  res.render('user/info',{data:[],roles:roles});

});

router.get('/login', async (req,res,next) => {
  let errorMessage = '';
  if(req.session.errorMessage){
    errorMessage = req.session.errorMessage
  }
  req.session.errorMessage = null;
  console.log(errorMessage);
  res.render('user/login',{errorMessage: errorMessage});
});

router.post('/login', async(req,res,next)=>{
  try{
    await client.connect();
    let user = await client.db(dbName).collection('users').findOne({username: req.body.username,password: req.body.password});
    
    if(user){
      req.session.user_id = user._id;
      req.session.role = user.role;
      res.redirect('/');
    }else{
      req.session.errorMessage = 'username or password error';
      res.redirect('/users/login');
    }
 
  }finally{
    await client.close();
  }
});

router.post('/logout', (req,res,next)=>{
  req.session.destroy(() => {
    console.log('session destroyed');
  })
  res.redirect("/users/login");
});

router.post('/save', async (req,res,next)=>{
  //update or create user
  try{
    await client.connect();
    let user = {};

    if (typeof req.body.id !=="undefined" &&req.body.id !=""){
        user._id = new ObjectId(req.body.id);
    }

    user.user_id = req.body.user_id;
    user.username = req.body.username;
    if (typeof req.body.password !=="undefined" && req.body.password !="" && typeof req.body.confirm_password !=="undefined" && req.body.confirm_password !=""){
      if(req.body.password === req.body.confirm_password){
        user.password = req.body.password;
      }
    }
    user.name = req.body.name;
    user.role = req.body.role; 
    user.created_at = new Date();
    user.updated_at = new Date();
    console.log(user);
    let data = {};
    if (typeof user._id !=="undefined" && user._id != ""){
      data = await client.db(dbName).collection("users").replaceOne({_id: new ObjectId(req.body.id)}, user);
      data = await client.db(dbName).collection("users").findOne({_id:new ObjectId(req.body.id)});
    }else{
      data = await client.db(dbName).collection("users").insertOne(user);
      await client.db(dbName).collection("logs").insertOne({information: `Create user: ${user.user_id},name: ${user.name},role: ${user.role}.`,type:"create",created_at:new Date(),updated_at:new Date()});
      data = await client.db(dbName).collection("users").findOne({_id:data.insertedId});
    }

    res.redirect(`/users/info/${data._id}`);
  }finally{
    await client.close();
  }
});

router.post('/delete',async (req,res,next) =>{
  try{
    let id = new ObjectId(req.body.user_id);
    await client.connect();
    let user = await client.db(dbName).collection("users").findOne({_id: id});
    await client.db(dbName).collection("users").deleteOne({_id: id});
    await client.db(dbName).collection("logs").insertOne({information: `Delete user: ${user.user_id},name: ${user.name},role: ${user.role}.`,type:"delete",created_at:new Date(),updated_at:new Date()});
    res.redirect("/users");
  }finally{
    await client.close();
  }
});

module.exports = router;
