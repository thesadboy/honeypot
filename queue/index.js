var clients = require('memory-cache');
var resultHandle = require('../utils/result_handle');

exports.addCases = function (uuid, ids) {
  ids.forEach(function (id) {
    addCase(uuid, id);
  });
};

var addCase = exports.addCase = function (uuid, id) {
  var client = clients.get(uuid) || {};
  client[id] = client[id] || new Queue(uuid, id);
  var queue = client[id];
  queue.needStop = false;
  queue.list = [];
  clients.put(uuid, client, 30 * 60 * 1000); //30分钟应该结束测试
};

var Queue = function (uuid, id) {
  this.uuid = uuid;
  this.id = id;
  this.list = [];
  this.needStop = false;
};
Queue.prototype = {
  put: function (item) {
    this.list.push(item);
    this.emit();
  },
  clear: function () {
    this.list = [];
  },
  setFinish: function () {
    for (var i = 0, size = this.list.length; i < size; i++) {
      this.list[i].finished = true;
    }
  },
  stop: function () {
    this.needStop = true;
    this.list = [];
  },
  emit: function () {
    resultHandle.handleResult(this.uuid, this.id, this);
  }
};