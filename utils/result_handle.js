var socket = require('./socket');
var timers = require('timers');
var resultHandles = {};

exports.registHandle = function(id, condition, callback) {
  resultHandles[id] = resultHandles[id] || [];
  resultHandles[id].push([condition, callback]);
};

exports.handleResult = function(uuid, id, queue) {
  var handles = resultHandles[id];
  if (queue.needStop) return;
  var list = queue.list;
  var latest = list[list.length - 1];
  var valid = [];
  list.forEach(function(item) {
    if (!item.finished) {
      valid.push(item);
    }
  });
  var req = latest.req;
  handles.forEach(function(handle) {
    var condition = handle[0];
    var cb = handle[1];
    if (condition.type == 'URI') {
      var uri = req.params[0];
      if (uri.match(condition.value)) {
        cb(valid, new Handle(uuid, id, queue));
        queue.setFinish();
      }
    }
  });
};

var Handle = function(uuid, id, queue) {
  this.uuid = uuid;
  this.id = id;
  this.queue = queue;
};

Handle.prototype = {
  /**
   * 发送信息
   * @param type
   * @param data
   * @returns {Handle}
   */
  send: function(type, data) {
    data.parent = '#' + this.id;
    data.id = '#' + type;
    socket.send(this.uuid, 'result', data);
    return this;
  },
  /**
   * 停止监听
   * @param type
   */
  stop: function(type) {
    this.queue.stop();
    if (type) {
      var data = {
        result: 'terminate'
      };
      this.send(type, data);
    }
    socket.send(this.uuid, 'end', {
      parent: '#' + this.id,
      msg: type ? '测试已终止' : '测试完毕',
      result: type ? 'terminate' : 'success'
    });
  },
  /**
   * 设置延时
   * @param ms
   * @param cb
   * @returns {Handle}
   */
  timeout: function(ms, cb) {
    var that = this;
    timers.setTimeout(function() {
      cb(that.queue);
    }, ms);
    return this;
  }
};