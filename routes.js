require('./strategy');
var path = require('path');
var sendHandle = require('./utils/send_handle');
var main = require('./service/main');
var media = require('./service/media');
var error = require('./service/errors');

exports.route = function (app) {
    app.get('/', main.index);
    app.get('/caselist', main.caseList);
    app.get('/case/error', error.caseError);
    app.get('/case/:id/*', sendHandle.handleSend, media.route);
}