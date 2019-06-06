const path = require('path');
const process = require('process');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const Koa = require('koa');
const koaWebpack = require('koa-webpack');
const cors = require('kcors');
const chalk = require('chalk');

const utils = require('./utils');

const imgRegex = /\.(png|jpe?g|gif|svg)(\?.*)?$/;

function readWebpackMemoryFile(compilerList, filePath) {
  for (let i = 0; i < compilerList.length; i++) {
    const fileCompiler = compilerList[i];
    if (fileCompiler.outputFileSystem.existsSync(filePath)) {
      const ext = path.extname(filePath).toLocaleLowerCase();
      if (imgRegex.test(ext)) {
        const base64 = fileCompiler.outputFileSystem.readFileSync(filePath).toString('base64');
        return `data:image/${ext.replace(/^\./, '')};base64,${base64}`;
      }
      return fileCompiler.outputFileSystem.readFileSync(filePath).toString('utf-8');
    }
  }
  return '';
}

async function createWebpackServer(configPath, option) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const webpackConfig = require(configPath);

  let hotClient = false;
  const devMiddleware = {
    lazy: false,
    quiet: false,
    noInfo: false,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    },
  };
  const target = webpackConfig.target || 'web';
  const app = new Koa();

  if (target === 'web') {
    // 将所有entry转换成Array格式，原因参考 https://github.com/webpack-contrib/webpack-hot-client/issues/11#issuecomment-385228256
    webpackConfig.entry = Object.keys(webpackConfig.entry).reduce((entries, key) => {
      /* eslint-disable no-param-reassign */
      const e = webpackConfig.entry[key];
      if (Array.isArray(e)) {
        entries[key] = e;
      } else {
        entries[key] = [e];
      }
      return entries;
      /* eslint-enable no-param-reassign */
    }, {});

    hotClient = {
      reload: true,
      host: utils.getIp(),
      port: option.port,
    };
  }

  const compiler = webpack(webpackConfig);

  // new webpack.ProgressPlugin().apply(compiler);
  new WebpackBar({ name: target }).apply(compiler);
  compiler.hooks.done.tap('EggWebpackReactPlugin', () => {
    process.send({ action: 'done' });
  });

  app.use(cors());

  try {
    const middleware = await koaWebpack({
      compiler,
      devMiddleware,
      hotClient,
    });

    app.use(middleware);
  } catch (ex) {
    process.stderr.write(ex);
  }

  app.listen(option.port, (err) => {
    if (!err && compiler) {
      const ip = utils.getIp();
      const url = `http://${ip}:${option.port}`;
      if (target) {
        process.stdout.write(chalk.green(`\r\n [egg-webpack-react] start webpack ${target} building server: ${url}`));
      } else {
        process.stdout.write(chalk.green(`\r\n [egg-webpack-react] start webpack building server: ${url}`));
      }
    }
  });

  return { app, compiler };
}

let server;
process.on('message', async (m) => {
  const { action, filePath } = m;
  if (action === 'build') {
    server = await createWebpackServer(m.webpackConfigPath, m.option);
  } else if (action === 'file') {
    if (server) {
      const fileContent = readWebpackMemoryFile([server.compiler], filePath);
      process.send({ action: 'file', fileContent, filePath });
    }
  }
});

process.on('SIGINT', () => {
  process.exit(0);
});
process.on('SIGTERM', () => {
  process.exit(0);
});
