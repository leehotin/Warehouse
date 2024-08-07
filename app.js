var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
const session = require('express-session');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productRouter = require('./routes/product');
var stockRouter = require('./routes/stock');
var deliveryOrderRouter = require('./routes/deliveryOrder');
var listRouter = require('./routes/productList'); 
var recycleBinRouter = require('./routes/recycleBin') ;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(session({secret:'Warehouse_In_Out_System', resave:false, saveUninitialized:true ,cookie:{expires: (60*60*1000) }}))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/product',productRouter);
app.use('/stock',stockRouter);
app.use('/deliveryOrder',deliveryOrderRouter);

app.use('/productlist', listRouter);
app.use('/getlayout', listRouter);         //另外響應的路由，都指向同一個路由做解釋，為了應付不同地方傳來的只要回傳JSON查詢用的詳見該路由最後一個.get方法
app.use('/recycleBin', recycleBinRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
