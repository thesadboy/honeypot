var socket = require('./socket');

exports.parse = function (str) {
  if (!str) return {};
  var obj = {};
  str = str.split(';');
  for (var i = 0; i < str.length; i++) {
    var strs = str[i].split('=');
    obj[strs[0].trim()] = strs[1];
  }
  return obj;
};