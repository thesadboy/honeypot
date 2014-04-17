  var socket = io.connect();
  socket.on('ready', function() {
    ready = true;
  }).on('wait', function(data) {
    waitMsg(data);
  }).on('result', function(data) {
    resultMsg(data);
  }).on('end', function(data) {
    endMsg(data);
  });