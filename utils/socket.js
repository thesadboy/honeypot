var cookieUtil = require('./cookie');
var sockets = {};

exports.handleSocket = function (io) {
  io.sockets.on('connection', function (socket) {
    var cookies = cookieUtil.parse(socket.handshake.headers.cookie);
    var uuid = cookies.uuid;
    sockets[uuid] = socket;
    socket.emit('ready');
    socket.on('disconnect', function () {
      delete socket[uuid];
    });
  });
};

exports.send = function (uuid, type, data) {
  var socket = sockets[uuid];
  if (!socket) return console.info('%s 已经断线，无法继续发送消息', uuid);
  socket.emit(type, data);
};