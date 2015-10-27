var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var sessionOptions = {
  secret: 'aspdj32143209v2DAs1fEHj65',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 15} // 15 dias
};

global._ = require('lodash');
var app = express();

require('./src/db')(function (err) {
  if (err) console.log('Erro ao ligar banco: ' + err);
  console.log('Banco ligado');
  
  var routes = require('./routes/index');


  // view engine setup
  // app.set('views', path.join(__dirname, 'gui'));
  // app.set('view engine', 'html');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(session(sessionOptions));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'gui')));

  app.use('/', routes);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.send({
        message: err.message || err,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message || err,
      error: {}
    });
  });
});

module.exports = app;
