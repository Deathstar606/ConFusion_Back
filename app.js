var express = require('express');
var path = require('path');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var session = require('express-session');
//var FileStore = require('session-file-store')(session);
var passport = require('passport');
//var authenticate = require('./authenticate');
var bodyParser = require('body-parser');
var config = require('./config');
const cors = require('cors');
require('dotenv').config();

var index = require('./routes/index');
var users = require('./routes/users');
var payments = require('./routes/paymentRouter');

var dishRouter = require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');
var favRouter = require('./routes/favouriteRouter');
var commentRouter = require('./routes/commentRouter')
var paymentRouter = require('./routes/bikashPaymentRoute');
var subcribeRouter = require('./routes/newsletter');
var uploadRouter = require('./routes/uploadRouter');

const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true)

// Connection URL
const url = config.mongoUrl
const connect = mongoose.connect(url, 
  { useNewUrlParser: true, 
    useUnifiedTopology: true })
 
connect.then((db) => {
    console.log("Connection OK!");
}, (err) => { console.log(err); });

const corsOptions = {
  origin: 'http://localhost:3001', // Replace with the origin of your client application
  credentials: true, // Allow sending cookies and other credentials with the request
  optionsSuccessStatus: 200 // Set the successful response status code for preflight requests
};


var app = express();

app.use(cors(corsOptions));

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + 3443 + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321'));

app.use(passport.initialize());

app.use('/', index);
app.use('/users', users);
app.use('/payments', payments);

/* app.options('/users/login', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).send(); // No content needed for preflight response
}); */

app.use(express.static(path.join(__dirname, 'public')));

/* app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001'); // Replace with your frontend's URL
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}); */

app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);
app.use('/favorites', favRouter);
app.use('/comments', commentRouter)
app.use('/api', paymentRouter)
app.use('/subscribe', subcribeRouter)
app.use('/imageUpload',uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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