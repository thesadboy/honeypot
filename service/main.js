var UUID = require('node-uuid');
var queue = require('../queue');
var logger = require('../utils/logger').logger('case');
var strategy = require('../strategy');
exports.index = function (req, res) {
  res.cookie('uuid', UUID.v4(), {
    maxAge: 1000 * 60 * 60 * 24
  });
  res.redirect('/caselist');
};
exports.caseList = function (req, res) {
  var uuid = req.cookies['uuid'];
  queue.addCases(uuid, strategy.getTestIds());
  logger.info('[TEST START WITH UUID: %s]', uuid);
  res.render('caselist', {
    cases: strategy.getCases(),
    host: req.headers.host,
    protocol : req.protocol,
    uuid: req.cookies['uuid']
  });
};