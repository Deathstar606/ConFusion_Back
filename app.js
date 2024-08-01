var express = require('express');
var path = require('path');
var logger = require('morgan');
var passport = require('passport');
var bodyParser = require('body-parser');
var config = require('./config');
const cors = require('cors');
require('dotenv').config();

var index = require('./routes/index');
var users = require('./routes/users');
var subcribers = require('./routes/subscribe');
var reservations = require('./routes/reservationRouter');
var home = require('./routes/homeRouter');
var gifts = require('./routes/giftRouter');
var giftCase = require("./routes/giftcaseRouter")
var headers = require('./routes/headerRouter')
var events = require('./routes/eventRouter')
var loactions = require('./routes/locationRouter')
var gallery = require('./routes/galleryRouter')
var caterMenu = require("./routes/caterRouter")
var orders = require('./routes/orderRouter');

var dishRouter = require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');
var favRouter = require('./routes/favouriteRouter');
var commentRouter = require('./routes/commentRouter');
var paymentRouter = require('./routes/bikashPaymentRoute');
var newsRouter = require('./routes/newsletter');
var uploadRouter = require('./routes/uploadRouter');

const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

// Connection URL
const url = config.mongoUrl;
console.log(url)
const connect = mongoose.connect(url, 
  { useNewUrlParser: true, 
    useUnifiedTopology: true });
 
connect.then((db) => {
    console.log("Connection OK!");
}, (err) => { console.log(err); });

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['https://deathstar606.github.io', 'http://localhost:3000', 'null'];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      console.log("allowed origin: ", origin);
      callback(null, true);
    } else {
      console.log("denied origin: ", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow sending cookies and other credentials with the request
  optionsSuccessStatus: 200 // Set the successful response status code for preflight requests
};

var app = express();

app.use(cors(corsOptions));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use('/', index);
app.use('/users', users);
app.use('/subscribe', subcribers);
app.use('/reservation', reservations);
app.use('/home', home);
app.use('/gifts', gifts);
app.use('/giftcase', giftCase);
app.use('/headers', headers);
app.use('/locations', loactions);
app.use('/events', events)
app.use('/gallery', gallery);
app.use('/catermenu', caterMenu)
app.use('/orders', orders);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);
app.use('/favorites', favRouter);
app.use('/comments', commentRouter);
app.use('/api', paymentRouter);
app.use('/sendnews', newsRouter);
app.use('/imageUpload', uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // log the error stack for debugging
  console.error(err.stack);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error', // Ensure 'title' is defined
    message: err.message,
    error: err
  });
});

const http = require('http');
const server = http.createServer(app);
server.setTimeout(10000); // 10 seconds
server.listen(process.env.PORT || 9000, () => {
  console.log('Server listening on port', process.env.PORT || 9000);
});

module.exports = app;
