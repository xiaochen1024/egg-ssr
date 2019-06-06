const { URL } = require('url');
const path = require('path');
const { createConfigManager } = require('./app/util/ConfigManager');

function loadExternalApi(app) {
  const apiDir = path.join(app.baseDir, 'app/api');
  app.loader.loadToContext(apiDir, 'api', {
    call: true,
    fieldClasses: 'apiClasses',
    ignore: ['base*.js', 'error/*.js'],
  });
}

function normalizeGlobalLocals(app) {
  const { externalAPI, resourceURL } = app.config;
  const apiConfig = {};
  Object.keys(externalAPI).forEach((gateway) => {
    const { defaultOptions, baseURL, proxyGateway, usercenter } = externalAPI[gateway];
    apiConfig[gateway] = { defaultOptions, baseURL, proxyGateway, usercenter };
  });

  const basename = new URL(resourceURL.h5root).pathname;
  Object.assign(resourceURL, { basename });

  app.locals.apiConfig = apiConfig;
  app.locals.resourceURL = resourceURL;
}

module.exports = async (app) => {
  app.addSingleton('configCenter', createConfigManager);
  normalizeGlobalLocals(app);

  app.beforeStart(async () => {
    loadExternalApi(app);
  });
};
