var Strategy = require('./').Strategy;
var UriUtil = require('../utils/uri');

var caseInfo = module.exports = {
    name: 'LIVE测试',
    desc: '测试播放器在live下的各种功能支持状况',
    index: 'index.m3u8',
    type: 'live',
    segment: 6,
    id: 'live',
    medias: 30
};

var strategylive = new Strategy(caseInfo.id);

//注册测试点
strategylive.registSendHandle(/index/, function (uri, handle) {
    handle.send('Ï-bandwidth-pre', { //播放器多码率预读
        msg: '播放器是否预读多码率信息'
    }).cookie('cookietest', 'cookiesupport').send('live-cookie', { //播放器cookie支持
        msg: '播放器是否支持COOKIE'
    }).send('live-key-pre', { //播放器KEY预读
        msg: '播放器是否预读KEY'
    });
});

//注册测试结果处理
strategylive.registResultHandle({
    type: 'URI',
    value: /_0\.ts/
}, function (list, handle) {
    //播放器多码率预读
    var names = [];
    list.forEach(function (item) {
        names.push(UriUtil.getNameByUrl(item.req.params[0]));
    });
    var isPreRead = false;
    if (names.indexOf('chunklist_b1115000.m3u8') >= 0 && names.indexOf('chunklist_b2568000.m3u8') >= 0 && names.indexOf('chunklist_b630000.m3u8') >= 0)
        isPreRead = true;
    handle.send('live-bandwidth-pre', {
        result: isPreRead ? 'success' : 'fail'
    });
}).registResultHandle({
    type: 'URI',
    value: /_1\.ts/
}, function (list, handle) {
    //播放器cookie支持
    var cookies = list[list.length - 1].req.cookies;
    handle.send('live-cookie', {
        result: cookies && cookies['cookietest'] ? 'success' : 'fail'
    });
}).registResultHandle({
    type: 'URI',
    value: /_4\.ts/
}, function (list, handle) {
    //播放器key预读
    list = handle.queue.list;
    var keyCount = 0;
    list.forEach(function (item) {
        if (item.req.params[0].match(/\.key/))
            keyCount++;
    });
    handle.send('live-key-pre', {
        result: keyCount > 1 ? 'success' : 'fail'
    });
}).registResultHandle({
    type: 'URI',
    value: /_37\.ts/
}, function (list, handle) {
    handle.stop();
});