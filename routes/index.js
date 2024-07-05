var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

async function checkLogin(req,res,next){
  try{
    if(req.session.user_id){
      await client.connect();
      let user = await client.db(dbName).collection('users').findOne({_id: req.session.user_id});
      if(user.length() == 1){
        req.session.user_id = user._id;
        req.session.role = user.role;
        return next();
      }
    }
    return res.redirect('/users/login');
  }finally{
    await client.close();
  }
}

module.exports = router;
