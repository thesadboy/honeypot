var fs = require('fs');
var path = require('path');
var resultHandle = require('../utils/result_handle');

var sendHandles = {};
var resultHandles = {};
var ids = [];
var cases = [];

exports.getSendHandles = function(id) {
  return sendHandles[id];
};
exports.getResultHandles = function() {
  return resultHandles;
};
exports.getTestIds = function() {
  return ids;
};
exports.getCases = function() {
  return cases;
};
exports.getCaseInfo = function(id) {
  for (var i = 0; i < cases.length; i++) {
    if (cases[i].id == id) {
      return cases[i];
    }
  }
  return null;
};


var Strategy = exports.Strategy = function(id) {
  ids.push(id);
  this.id = id;
  sendHandles[id] = [];
  resultHandles[id] = [];
}

Strategy.prototype = {
  constructor: Strategy,
  registSendHandle: function(regExp, callback) {
    sendHandles[this.id].push([regExp, callback]);
    return this;
  },
  registResultHandle: function(condition, callback) {
    resultHandles[this.id].push([condition, callback]);
    resultHandle.registHandle(this.id, condition, callback);
    return this;
  }
};

/**
 *  引入所有的Strategy文件
 */
(function requireStrategies() {
  var files = fs.readdirSync(__dirname);
  files.forEach(function(file) {
    if (file != path.basename(__filename)) {
      cases.push(require(path.join(__dirname, file)));
    }
  });
})();