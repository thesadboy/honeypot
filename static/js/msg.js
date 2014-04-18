$(function () {
  waitReady();
});

var waitReady = function () {
  if (ready) return readyTest();
  setTimeout(waitReady, 1000);
};
var readyTest = function () {
  $('#wait-ready').removeClass('result-wait').addClass('result-success').html('系统已经准备好，可以开始测试，请在30分钟内完成测试并不要刷新页面');
};

var waitMsg = function (data) {
  var html = $(data.parent + ' ' + data.id);
  if (html.length == 0) {
    html = $('<div class="result-item result-wait"></div>').attr('id', data.id.replace('#', ''));
    html.html(data.msg);
    $(data.parent).append(html);
  }
};

var resultMsg = function (data) {
  var html = $(data.parent + ' ' + data.id);
  if (html.length == 0 || html.data('result'))
    return;
  html.removeClass('result-wait').addClass('result-' + data.result).data('result', true);
};

var endMsg = function (data) {
  var html = $(data.parent + '' + data.parent + '-end');
  if (html.length == 0) {
    html = $('<div class="result-item result-' + data.result + '">' + data.msg + '</div>').attr('id', data.parent.replace('#', '') + '-end');
    $(data.parent).append(html);
  }
}