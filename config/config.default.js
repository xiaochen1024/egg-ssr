const path = require('path');

module.exports = (appInfo) => {
  const exports = {};

  // use for cookie sign key, should change to your own and keep security
  exports.keys = `${appInfo.name}_Yid`;

  exports.middleware = ['parseConfig', 'errorHandler', 'access'];

  exports.session = {
    key: 'session',
    httpOnly: true,
  };

  exports.security = {
    csrf: {
      enable: false,
    },
    methodnoallow: {
      enable: false,
    },
    domainWhiteList: [
      '',
    ],
  };

  exports.multipart = {
    fileSize: '10M',
    whitelist: ['.map', '.zip'],
  };

  exports.cors = {
    credentials: true,
  };

  exports.logger = {
    consoleLevel: 'DEBUG',
    dir: path.join(appInfo.baseDir, 'logs'),
  };

  exports.static = {
    maxAge: 60 * 60 * 24 * 365,
    prefix: '/h5/public/',
    dir: [
      path.join(appInfo.baseDir, 'public'),
    ],
  };

  exports.reactssr = {
    fallbackToClient: true,
  };

  // baseInteranlURL, baseURL通过ConfigManager从配置中心获取
  exports.externalAPI = {
    gateway: {
      baseURL: '',
      defaultOptions: {
        withCredentials: true,
        headers: {
          common: {
            Accept: 'application/json',
          },
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    },
  };

  return exports;
};
