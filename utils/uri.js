var Url = require('url');
var Path = require('path');

exports.getRequestType = function(req) {
  var url = req.url;
  var parsed = Url.parse(url);
  var pathname = parsed.pathname;
  var extname = Path.extname(pathname);
  if (!extname) {
    return 'INDEX';
  } else if (extname.match(/m3u/i)) {
    return 'M3U8';
  } else if (extname.match(/ts/i)) {
    return 'TS';
  } else if (extname.match(/key/i)) {
    return 'KEY';
  } else {
    return 'FILE';
  }
};

exports.getFilePath = function(type, req) {
  var id = req.params.id;
  var uripath = req.params[0];
  var path = '';
  if (type == 'INDEX') {
    path = Path.join(__dirname, '..', 'resource', id, 'index.m3u8');
  } else {
    path = Path.join(__dirname, '..', 'resource', id, Url.parse(uripath).pathname);
  }
  return path;
}

var getNameByUrl = exports.getNameByUrl = function(url) {
  if (!url) return '';
  var pathnames = Url.parse(url).pathname.split('/');
  return pathnames[pathnames.length - 1];
}

exports.replaceM3U8Url = function(str, id, uuid) {
  var keyPos = -1;
  str = str.replace(/(#EXT-X-STREAM-INF[^\n\r]+[\n\r])(^[^\n\r]+)/gim, function(matches, $1, $2) {
    //STREAM
    var uri = '/case/' + id + '/' + getNameByUrl($2) + '?uuid=' + uuid;
    // console.log($2);
    return $1 + uri;
  }).replace(/(#EXT-X-KEY[^\n\r]+URI=")([^\"\r\n]+)("[^\n\r]+)/gi, function(matches, $1, $2, $3) {
    //KEY
    keyPos++;
    var keyName = getNameByUrl($2);
    if (Path.extname(keyName) == '') {
      keyName = 'key_' + keyPos + '.key';
    }
    var uri = '/case/' + id + '/key/' + keyName + '?uuid=' + uuid;
    return $1 + uri + $3;
  }).replace(/(#EXTINF\:[^\r\n]+[\r\n])([^\n\r]+)/gim, function(matches, $1, $2) {
    //EXTINF
    var uri = '/case/' + id + '/ts/' + getNameByUrl($2) + '?uuid=' + uuid;
    return $1 + uri;
  });
  return str;
};