/**
 * Created by Nick on 14-4-17.
 */
exports.caseError = function (req, res) {
  return res.status(403).send('<h2>403 禁止访问</h2><h4>加载测试用例失败</h4>请点击用例页面的“重新生成用例”并复制用例链接重新测试！');
};