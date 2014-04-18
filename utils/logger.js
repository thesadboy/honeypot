var log4js = require('log4js');

//log4js.configure({
//    appenders: [
//        {
//            type: 'file',
//            filename: 'logs/access.log',
//            maxLogSize: 10 * 1024 * 1024,
//            bakups: 5,
//            category: 'normal'
//        },
//        {
//            type: 'file',
//            filename: 'logs/case.log',
//            maxLogSize: 10 * 1024 * 1024,
//            bakups: 5,
//            category: 'case'
//        }
//    ]
//});

log4js.configure({
  appenders: [
    {
      type: 'console'
    },
    {
      type: 'file',
      filename: 'logs/access.log',
      maxLogSize: 10 * 1024 * 1024,
      bakups: 5,
      category: 'normal'
    },
    {
      type: 'file',
      filename: 'logs/case.log',
      maxLogSize: 10 * 1024 * 1024,
      bakups: 5,
      category: 'case'
    }
  ],
  replaceConsole: true
});

var logger = exports.logger = function (name) {
  var logger = log4js.getLogger(name);
  logger.setLevel('INFO');
  return logger;
};

exports.uselogger = function (name, options) {
  var applogger = logger(name);
  return log4js.connectLogger(applogger, options);
};