/* eslint-disable no-param-reassign */

const path = require('path');
const vm = require('vm');
const kproxy = require('koa-proxy');
const NativeModule = require('module');
const fs = require('fs');

const constants = require('./lib/constants');

module.exports = (app) => {
  if (app.view) {
    app.view.resolve = function resolve(name) {
      return Promise.resolve(name);
    };
  }

  const requireFromWebpack = async (name) => {
    const filePath = path.isAbsolute(name) ? name : path.join(app.config.view.root[0], name);
    const code = await app.webpack.fileSystem.readWebpackMemoryFile(filePath, name);
    if (!code) {
      throw new Error(`read webpack memory file[${filePath}] content is empty, please check if the file exists`);
    }
    const wrapper = NativeModule.wrap(code);
    vm.runInThisContext(wrapper)(exports, require, module, __filename, __dirname);
    const clazz = exports.default ? exports : module.exports;
    return clazz;
  };

  if (app.react) {
    const render = app.react.render.bind(app.react);
    app.react.render = async (name, locals, options) => {
      const reactComponent = await requireFromWebpack(name);
      return render(reactComponent, locals, options);
    };
  }

  app.use(async (ctx, next) => {
    if (app.webpack_build_success) {
      await next();
    } else if (app.webpack_loading_text) {
      ctx.body = app.webpack_loading_text;
    } else {
      const filePath = path.resolve(__dirname, './lib/template/loading.html');
      app.webpack_loading_text = fs.readFileSync(filePath, 'utf8');
      ctx.body = app.webpack_loading_text;
    }
  });

  app.messenger.on(constants.MESSENGER_WEBPACK_BUILD_STATE, (data) => {
    app.webpack_build_success = data.state;
  });

  app.ready(() => {
    app.messenger.sendToAgent(constants.MESSENGER_WEBPACK_BUILD_STATE);
  });


  const config = app.config.webpack;
  if (config.proxy) {
    if (typeof config.proxy === 'boolean') {
      config.proxy = {
        host: 'http://127.0.0.1:9000',
        match: /^\/public\//,
      };
    }
    app.use(kproxy(config.proxy));
  }
};
