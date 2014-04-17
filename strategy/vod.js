var Strategy = require('./').Strategy;
var UriUtil = require('../utils/uri');

var caseInfo = module.exports = {
  name: 'VOD测试',
  desc: '测试播放器在VOD下的各种功能支持状况',
  index: 'index.m3u8',
  type:'vod',
  segment: 10,
  id: 'vod'
};

var strategyVod = new Strategy(caseInfo.id);

//注册测试点
strategyVod.registSendHandle(/index/, function(uri, handle) {
  handle.send('vod-bandwidth-pre', { //播放器多码率预读
    msg: '播放器是否预读多码率信息'
  }).cookie('cookietest', 'cookiesupport').send('vod-cookie', { //播放器cookie支持
    msg: '播放器是否支持COOKIE'
  }).send('vod-key-pre', { //播放器KEY预读
    msg: '播放器是否预读KEY'
  });
}).registSendHandle(/_0\.ts/, function(uri, handle) {
  handle.send('vod-ts-pre', { //播放器是否预读TS
    msg: '播放器是否预读TS'
  });
}).registSendHandle(/_1[0-4]\.ts/, function(uri, handle) {
  handle.limit(500).send('vod-speed-change', { //播放器码率切换
    msg: '播放器是否支持自动切换码率'
  })
}).registSendHandle(/_(1[5-9])|(2[0-4])\.ts/, function(uri, handle) {
  handle.limit(180);
}).registSendHandle(/_(2[5-9])(3[0-5])\.ts/, function(uri, handle) {
  handle.limit(80);
});


//注册测试结果处理
strategyVod.registResultHandle({
  type: 'URI',
  value: /_0\.ts/
}, function(list, handle) {
  //播放器多码率预读
  var names = [];
  list.forEach(function(item) {
    names.push(UriUtil.getNameByUrl(item.req.params[0]));
  });
  var isPreRead = false;
  if (names.indexOf('chunklist_b1115000.m3u8') >= 0 && names.indexOf('chunklist_b2568000.m3u8') >= 0 && names.indexOf('chunklist_b630000.m3u8') >= 0)
    isPreRead = true;
  handle.send('vod-bandwidth-pre', {
    result: isPreRead ? 'success' : 'fail'
  });
}).registResultHandle({
  type: 'URI',
  value: /_1\.ts/
}, function(list, handle) {
  //播放器cookie支持
  var cookies = list[list.length - 1].req.cookies;
  handle.send('vod-cookie', {
    result: cookies && cookies['cookietest'] ? 'success' : 'fail'
  });
}).registResultHandle({
  type: 'URI',
  value: /_4\.ts/
}, function(list, handle) {
  //播放器key预读
  list = handle.queue.list;
  var keyCount = 0;
  list.forEach(function(item) {
    if (item.req.params[0].match(/\.key/))
      keyCount++;
  });
  handle.send('vod-key-pre', {
    result: keyCount > 1 ? 'success' : 'fail'
  });
}).registResultHandle({
  type: 'URI',
  value: /_5\.ts/
}, function(list, handle) {
  //播放器预读ts
  var now = new Date();
  list = handle.queue.list;
  var tsCount = 0;
  list.forEach(function(item) {
    if (now - item.time <= 10000 && UriUtil.getNameByUrl(item.req.params[0]).match(/\.ts/)) {
      tsCount++;
    }
  });
  handle.send('vod-ts-pre', {
    result: tsCount > 1 ? 'success' : 'fail'
  });
}).registResultHandle({
  type: 'URI',
  value: /_36\.ts/
}, function(list, handle) {
  //播放器码率变换支持
  var count1115000 = 0;
  var count2568000 = 0;
  var count630000 = 0;
  list.forEach(function(item) {
    var matches = UriUtil.getNameByUrl(item.req.params[0]).match(/(media_b1115000)|(media_b2568000)|(media_b630000)/);
    if (matches) {
      if (matches[1]) count1115000++;
      if (matches[2]) count2568000++;
      if (matches[3]) count630000++;
    }
  });
  var level = 0;
  if (count1115000 > 0)
    level++;
  if (count2568000 > 0)
    level++;
  if (count630000 > 0)
    level++;
  handle.send('vod-speed-change', {
    result: level > 2 ? 'success' : level > 1 ? 'warn' : 'fail'
  })
}).registResultHandle({
  type: 'URI',
  value: /_37\.ts/
}, function(list, handle) {
  handle.stop();
});