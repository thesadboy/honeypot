var Mime = require('mime');
var logger = require('./logger').logger('case');

exports.defaultHeaders = function (res, stat) {
  if (!res.getHeader('Accept-Ranges')) res.setHeader('Accept-Ranges', 'bytes');
  if (!res.getHeader('ETag')) res.setHeader('ETag', etag(stat));
  if (!res.getHeader('Date')) res.setHeader('Date', new Date().toUTCString());
  if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + (0 / 1000));
  if (!res.getHeader('Last-Modified')) res.setHeader('Last-Modified', stat.mtime.toUTCString());
};
exports.setContentLength = function (res, stat) {
  if (res.setHeader('Content-Length', stat.size));
};
exports.setContentType = function (res, path) {
  if (res.getHeader('Content-Type')) return;
  var type = Mime.lookup(path);
  var charset = Mime.charsets.lookup(type);
  res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
};
exports.setCookies = function (res) {
  if (res.scookies) {
    var cookies = res.scookies;
    cookies.forEach(function (cookie) {
      res.cookie(cookie[0], cookie[1], {
        path: '/',
        maxAge: 30 * 60 * 1000
      });
    });
  }
};
exports.setHeaders = function (res) {
  if (res.sheaders) {
    var headers = res.sheaders;
    headers.forEach(function (header) {
      res.setHeader(header[0], header[1]);
    });
  }
};
exports.setStatusCode = function (res) {
  if (res.sstatus) res.status(res.sstatus);
}
var etag = function (stat) {
  return '"' + stat.size + '-' + Number(stat.mtime) + '"';
};