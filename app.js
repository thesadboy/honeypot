/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var routes = require('./routes');
var sendHandle = require('./utils/send_handle');
var logger = require('./utils/logger');
var socket = require('./utils/socket');
var app = express();

// all environments
app.set('port', process.env.PORT || 2000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(logger.uselogger('normal', {
  level: 'auto'
}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(sendHandle.initHandle());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'static')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var server = http.createServer(app);
var io = require('socket.io').listen(server, {
  log: false
});
server.listen(app.get('port'), function () {
  console.log('Honeypot server listening on port %d', app.get('port'));
});

socket.handleSocket(io);
routes.route(app);