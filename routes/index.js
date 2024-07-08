var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");

router.get('/', function(req, res, next) {
  res.render('index');
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
