import path from 'path';
import process from 'process';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import merge from 'lodash/merge';
import nodeExternals from 'webpack-node-externals';

import * as utils from '../utils';
import moduleAliases from '../../tools/moduleAliases';

const SUPPORT_BROWSERS = ['Android >= 4.4.4', 'iOS >= 9'];
const GLOBALS = {
  ENV_IS_DEV: process.env.NODE_ENV === 'development',
  ENV_IS_NODE: true,
};

const isDev = process.env.NODE_ENV === 'development';
const baseDir = process.cwd();
const outputPath = 'app/view';

const babelLoaderConfig = {
  loader: 'babel-loader',
  options: {
    babelrc: false,
    cacheDirectory: '.tmp/babel-loader',
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: 'usage',
          targets: { node: '8.11' },
        },
      ],
      '@babel/preset-react',
    ],
    plugins: [
      ['import', { libraryName: 'antd-mobile' }],
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-optional-chaining', { loose: true }],
    ],
  },
};

const entryConfig = {
  include: [
    'app/web/pages',
    { layout: 'app/web/framework/layout/layout.jsx' },
  ],
  exclude: ['app/web/pages/test'],
};

const normalEntries = utils.getEntry(entryConfig, baseDir);
const entries = merge({
}, normalEntries);

// 保留注释，用以测试指定页面
// const entries = {
//   index: 'app/web/pages/index.jsx',
//   entries: 'app/web/pages/entries.jsx',
//   layout: 'app/web/framework/layout/layout.jsx',
// };

export default {
  target: 'node',
  context: baseDir,
  entry: entries,
  externals: [nodeExternals({
    modulesFromFile: { include: ['dependencies'] },
  })],
  output: {
    path: path.join(baseDir, outputPath),
    publicPath: '/h5/public/',
    filename: '[name].js',
    chunkFilename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  plugins: [
    // Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    new webpack.DefinePlugin(GLOBALS),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/, /app\/api/],
        oneOf: [
          {
            resourceQuery: /layout/,
            use: [babelLoaderConfig, require.resolve('../loaders/serverLayoutLoader')],
          }, {
            use: [babelLoaderConfig],
          },
        ],
      }, {
        test: /\.less$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
              modules: false,
            },
          }, {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
              plugins: () => [autoprefixer({ browsers: SUPPORT_BROWSERS })],
            },
          }, {
            loader: 'less-loader',
            options: { javascriptEnabled: true, sourceMap: isDev },
          },
        ],
      }, {
        test: /\.css$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
              modules: false,
            },
          }, {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
              plugins: () => [autoprefixer({ browsers: SUPPORT_BROWSERS })],
            },
          },
        ],
      }, {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?(#\S*)?$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: 'styles/fonts/[name].[ext]',
          emitFile: false,
        },
      }, {
        test: /\.(png|jp(e)?g|gif)$/,
        exclude: /node_modules\/(?!(pdfjs-dist)\/).*/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]',
          emitFile: false,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.jsx', '.js'],
    modules: ['node_modules'].concat(moduleAliases.webpack.root),
    alias: moduleAliases.webpack.alias,
  },
};
