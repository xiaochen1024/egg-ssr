/* eslint-disable no-console */

import process from 'process';
import webpack from 'webpack';
import WebpackBar from 'webpackbar';
import webpackDevConfig from './webpackDevConfig';
import webpackProdConfig from './webpackProdConfig';

const webpackConfig = process.env.NODE_ENV === 'development'
  ? webpackDevConfig : webpackProdConfig;

const compiler = webpack(webpackConfig);

if (process.env.NODE_ENV === 'development') {
  // new webpack.ProgressPlugin().apply(compiler);
  new WebpackBar({
    profile: true,
  }).apply(compiler);
}

compiler.run((err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    process.exit(1);
  }

  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  }));

  if (stats.hasErrors()) {
    process.exit(1);
  }
});
