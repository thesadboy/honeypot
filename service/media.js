var UriUtil = require('../utils/uri');
var Fs = require('fs');
var Path = require('path');
var Strategy = require('../strategy');
var Live = require('./media_live');
var clients = require('memory-cache');
var Timers = require('timers');

exports.route = function (req, res, next) {
  var requestType = UriUtil.getRequestType(req);
  var id = req.params.id;
  var uuid = req.query.uuid;
  var caseInfo = Strategy.getCaseInfo(id);
  var path = UriUtil.getFilePath(requestType, req);
  var client = clients.get(uuid);
  if (!client) {
    return res.redirect('/case/error');
  }
  if (requestType == 'INDEX') {
    if (caseInfo.type == 'live') {
      //首次进入live测试
      if (client[id].timer) {
        Timers.clearInterval(client[id].timer);
      }
      client[id].timer = Timers.setInterval(function () {
        client[id].pos++;
      }, caseInfo.segment * 1000);
      client[id].pos = 0;
      client[id].medias = caseInfo.medias;
    }
    return res.redirect(req.url.replace('index', caseInfo.index));
  }
  if (requestType == 'M3U8') {
    if (caseInfo.type == 'live') {
      return Live.getM3U8(caseInfo, path, req, res, next);
    } else {
      return getM3U8(path, req, res, next);
    }
  }
  if (requestType == 'TS')
    return getTS(path, req, res, next);
  if (requestType == 'KEY')
    return getKey(path, req, res, next);
  res.sendfile(path);
};
var getM3U8 = function (path, req, res, next) {
  var id = req.params.id;
  var uuid = req.query.uuid;
  var m3u8 = Fs.readFileSync(path).toString();
  m3u8 = UriUtil.replaceM3U8Url(m3u8, id, uuid);
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Content-Length', new Buffer(m3u8).length);
  res.send(m3u8);
};
var getKey = function (path, req, res, next) {
  res.setHeader('Content-Type', 'text/plain');
  res.sendfile(path);
};
var getTS = function (path, req, res, next) {
  var id = req.params.id;
  var uuid = req.query.uuid;
  var live = clients.get(uuid)[id];
  var medias = live ? live.medias : null;
  if (medias) {
    path = path.replace(/^([^#]+_)(\d+)(\.ts.*)/, function (matches, $1, $2, $3) {
      return $1 + (Number($2) % medias) + $3;
    });
  }
  res.nsendfile(path);
};