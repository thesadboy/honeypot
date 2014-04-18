var initSocket = function (url) {
  var socket = io.connect(url);
  socket.on('ready', function () {
    readyTest();
  }).on('wait', function (data) {
    waitMsg(data);
  }).on('result', function (data) {
    resultMsg(data);
  }).on('end', function (data) {
    endMsg(data);
  });
};