var Strategy = require('./').Strategy;
var UriUtil = require('../utils/uri');

var caseInfo = module.exports = {
  name: 'VOD清流测试',
  desc: '测试播放器在VOD清流下的各种功能支持状况',
  index: 'index.m3u8',
  type: 'vod',
  segment: 10,
  id: 'vod-free'
};

var strategyVod = new Strategy(caseInfo.id);

//注册测试点
strategyVod.registSendHandle(/index/, function (uri, handle) {
  handle.send('vod-free-bandwidth-pre', { //播放器多码率预读
    msg: '播放器是否预读多码率信息'
  }).cookie('cookietest', 'cookiesupport').send('vod-free-cookie', { //播放器cookie支持
    msg: '播放器是否支持COOKIE'
  });
}).registSendHandle(/_0\.ts/, function (uri, handle) {
  handle.send('vod-free-ts-pre', { //播放器是否预读TS
    msg: '播放器是否预读TS'
  });
}).registSendHandle(/_1[0-4]\.ts/, function (uri, handle) {
  handle.limit(500).send('vod-free-speed-change', { //播放器码率切换
    msg: '播放器是否支持自动切换码率'
  })
}).registSendHandle(/_(1[5-9])|(2[0-4])\.ts/, function (uri, handle) {
  handle.limit(180).delay(2000);
}).registSendHandle(/_(2[5-9])\.ts/, function (uri, handle) {
  handle.limit(80).delay(2000);
});

//注册测试结果处理
strategyVod.registResultHandle({
  type: 'URI',
  value: /_0\.ts/
}, function (list, handle) {
  //播放器多码率预读
  var names = [];
  list.forEach(function (item) {
    names.push(UriUtil.getNameByUrl(item.req.params[0]));
  });
  var isPreRead = false;
  if (names.indexOf('chunklist_b1053000.m3u8') >= 0 && names.indexOf('chunklist_b2526000.m3u8') >= 0 && names.indexOf('chunklist_b559000.m3u8') >= 0)
    isPreRead = true;
  handle.send('vod-free-bandwidth-pre', {
    result: isPreRead ? 'success' : 'fail'
  });
}).registResultHandle({
  type: 'URI',
  value: /_1\.ts/
}, function (list, handle) {
  //播放器cookie支持
  var cookies = list[list.length - 1].req.cookies;
  handle.send('vod-free-cookie', {
    result: cookies && cookies['cookietest'] ? 'success' : 'fail'
  });
}).registResultHandle({
  type: 'URI',
  value: /_5\.ts/
}, function (list, handle) {
  //播放器预读ts
  var now = new Date();
  list = handle.queue.list;
  var tsCount = 0;
  list.forEach(function (item) {
    if (now - item.time <= 10000 && UriUtil.getNameByUrl(item.req.params[0]).match(/\.ts/)) {
      tsCount++;
    }
  });
  handle.send('vod-free-ts-pre', {
    result: tsCount > 1 ? 'success' : 'fail'
  });
}).registResultHandle({
  type: 'URI',
  value: /_29\.ts/
}, function (list, handle) {
  //播放器码率变换支持
  var count1053000 = 0;
  var count2526000 = 0;
  var count559000 = 0;
  list.forEach(function (item) {
    var matches = UriUtil.getNameByUrl(item.req.params[0]).match(/(media_b1053000)|(media_b2526000)|(media_b559000)/);
    if (matches) {
      if (matches[1]) count1053000++;
      if (matches[2]) count2526000++;
      if (matches[3]) count559000++;
    }
  });
  var level = 0;
  if (count1053000 > 0)
    level++;
  if (count2526000 > 0)
    level++;
  if (count559000 > 0)
    level++;
  handle.send('vod-free-speed-change', {
    result: level > 2 ? 'success' : level > 1 ? 'warn' : 'fail'
  })
}).registResultHandle({
  type: 'URI',
  value: /_30\.ts/
}, function (list, handle) {
  handle.stop();
});