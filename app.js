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
var subcribers = require('./routes/subscribe');
var payments = require('./routes/paymentRouter');

var dishRouter = require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');
var favRouter = require('./routes/favouriteRouter');
var commentRouter = require('./routes/commentRouter')
var paymentRouter = require('./routes/bikashPaymentRoute');
var newsRouter = require('./routes/newsletter');
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
  origin: (origin, callback) => {
    const allowedOrigins = ['https://deathstar606.github.io', 'http://localhost:3000'];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow sending cookies and other credentials with the request
  optionsSuccessStatus: 200 // Set the successful response status code for preflight requests
};


var app = express();

app.use(cors(corsOptions));

/* app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + 3443 + req.url);
  }
}); */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use('/', index);
app.use('/users', users);
app.use('/subscribe', subcribers);
app.use('/payments', payments);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);
app.use('/favorites', favRouter);
app.use('/comments', commentRouter)
app.use('/api', paymentRouter)
app.use('/sendnews', newsRouter)
app.use('/imageUpload',uploadRouter);

const http = require('http');
const server = http.createServer(app);
server.setTimeout(30000); // 30 seconds
server.listen(process.env.PORT || 9000, () => {
  console.log('Server listening on port', process.env.PORT || 9000);
});

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