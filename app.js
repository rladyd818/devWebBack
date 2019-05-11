var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
var websocket = require('./socket');
var mongoose = require('mongoose');
var bluebird = require('bluebird');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var sess = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}

var mongUrl = 'mongdb://localhost:27017/admin';
(mongoose).Promise = bluebird;
mongoose.connect(mongUrl, { useNewUrlParser: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolve to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. please make sure MongoDB is running. " + err);
  // process.exit();
});
mongoose.set('useCreateIndex', true);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 3000);

//////////////////////////////////////////
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(porcess.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sess));

app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get("*", (rreq, res, next) => {
  res.sendFile(path.resolve(_dirname, '.public/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
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

const server = app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});

websocket(server);

module.exports = app;
