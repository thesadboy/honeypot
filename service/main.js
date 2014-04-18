var UUID = require('node-uuid');
var config = require('../config');
var queue = require('../queue');
var logger = require('../utils/logger').logger('case');
var strategy = require('../strategy');
exports.index = function (req, res, next) {
  res.cookie('uuid', UUID.v4(), {
    maxAge: 1000 * 60 * 60 * 24
  });
  res.redirect('/caselist');
};
exports.caseList = function (req, res, next) {
  var uuid = req.cookies['uuid'];
  queue.addCases(uuid, strategy.getTestIds());
  logger.info('[TEST START WITH UUID: %s]', uuid);
  res.render('caselist', {
    cases: strategy.getCases(),
    host: req.headers.host,
    uuid: req.cookies['uuid']
  });
};