var Throttle = require('throttle');
var Mime = require('mime');
var Path = require('path');
var Fs = require('fs');
var Timers = require('timers');
var Strategy = require('../strategy');
var SendUtil = require('./send_util');
var socket = require('./socket');
var logger = require('./logger').logger('case');
var ResultHandle = require('./result_handle').ResultHandle;
var clients = require('memory-cache');
var cloneObject = require('./util').cloneObject;

//初始化Handle
exports.initHandle = function() {
  return function(req, res, next) {
    //发送文件
    res.nsendfile = function(path) {
      var self = this;
      Timers.setTimeout(function() {
        //not found
        if (!Fs.existsSync(path)) {
          return next();
        }
        var stat = Fs.statSync(path);
        SendUtil.defaultHeaders(self, stat);
        SendUtil.setContentLength(self, stat);
        SendUtil.setContentType(self, path);
        SendUtil.setHeaders(res);
        SendUtil.setCookies(res);
        SendUtil.setStatusCode(res);
        var fileStream = Fs.createReadStream(path);
        if (self.slimit) {
          var throttle = new Throttle(self.slimit);
          fileStream.pipe(throttle).pipe(self);
          throttle.on('end', function() {
            self.end();
          });
        } else {
          fileStream.pipe(self);
          fileStream.on('end', function() {
            self.end();
          });
        }
      }, self.sdelay || 0);
    }
    next();
  }
};

//Handle Send
exports.handleSend = function(req, res, next) {
  //记录日志
  logger.info('{uuid: %s, id: %s, uri: %s}', req.query.uuid, req.params.id, req.params[0]);
  var id;
  var uripath;
  var uuid = '';
  if (req.query)
    uuid = req.query.uuid;
  if (req.params) {
    id = req.params.id;
    uripath = req.params[0];
  }
  if (id && uripath)
    registHandle(id, uuid, uripath, req, res);
  if (id && uuid) {
    //将访问记录放入队列中
    var client = clients.get(uuid);
    if (client) {
      var queue = client[id];
      (function(req, res, queue) {
        var data = {
          time: new Date(),
          req: req,
          res: {
            headers: res.headers
          },
          finished: false
        };
        if (queue && !queue.needStop)
          queue.put(data);
      })(req, res, queue);
    }
  }
  next();
};


var Handle = function(req, res, id, uuid) {
  this.req = req;
  this.res = res;
  this.id = id;
  this.uuid = uuid;
  this.datas = {};
};
Handle.prototype = {
  header: function(key, value) {
    if (key != null && value != null) {
      this.res.sheaders = this.res.sheaders || [];
      this.datas.headers = this.datas.headers || [];
      this.res.sheaders.push([key, value]);
      this.datas.headers.push([key, value]);
    }
    return this;
  },
  cookie: function(key, value) {
    if (key != null && value != null) {
      this.res.scookies = this.res.scookies || [];
      this.datas.cookies = this.datas.cookies || [];
      this.res.scookies.push([key, value]);
      this.datas.cookies.push([key, value]);
    }
    return this;
  },
  status: function(code) {
    if (isNaN(code)) throw new Error('status code must be a number');
    this.res.sstatus = code;
    this.datas.status = code;
    return this;
  },
  delay: function(ms) {
    if (isNaN(ms) || ms < 0) throw new Error('delay must be a number equals 0 or greater than 0');
    this.res.sdelay = ms;
    this.datas.delay = ms;
    return this;
  },
  limit: function(kb) {
    if (isNaN(kb) || kb < 1) throw new Error('limit must be a number greater tha 0');
    this.res.slimit = kb * 1024;
    this.datas.limit = kb * 1024;
    return this;
  },
  send: function(type, data) {
    data.parent = '#' + this.id;
    data.id = '#' + type;
    socket.send(this.uuid, 'wait', data);
    return this;
  },
  emit: function(type) {
    var handle = new ResultHandle();
    handle.handleResult(this.uuid, this.id, type, this.req, this.res, this.datas);
    return this;
  }
};

var registHandle = function(id, uuid, uripath, req, res) {
  var sendHandles = Strategy.getSendHandles(id);
  if (sendHandles) {
    var handle = new Handle(req, res, id, uuid);
    sendHandles.forEach(function(sendHandle) {
      if (uripath.match(sendHandle[0])) {
        sendHandle[1](uripath, handle);
      }
    });
  }
};