import path from 'path';
import process from 'process';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import MiniCSSExtractPlugin from 'mini-css-extract-plugin';
import ManifestResourcePlugin from 'webpack-manifest-resource-plugin';
import merge from 'lodash/merge';

import moduleAliases from '../../tools/moduleAliases';
import theme from './theme';
import * as utils from '../utils';

const SUPPORT_BROWSERS = ['Android >= 4.4.4', 'iOS >= 9'];
const GLOBALS = {
  ENV_IS_DEV: process.env.NODE_ENV === 'development',
  ENV_IS_NODE: false,
};

const isDev = process.env.NODE_ENV === 'development';
const baseDir = process.cwd();
const outputPath = 'public';

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
          targets: { browsers: SUPPORT_BROWSERS },
        },
      ],
      '@babel/preset-react',
    ],
    plugins: [
      ['import', { libraryName: 'antd-mobile', style: true }],
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
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

const vendors = [
  'react',
  'react-dom',
  'react-router',
  'mobx',
  'mobx-react',
  'axios',
];

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
  target: 'web',
  context: baseDir,
  entry: entries,
  output: {
    path: path.join(baseDir, outputPath),
    publicPath: '/h5/public/',
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/[name].js',
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendors: {
          chunks: 'initial',
          test: new RegExp(vendors.join('|')),
          name: 'vendors',
          priority: 10,
          enforce: true,
        },
        default: {
          chunks: 'initial',
          minChunks: 2,
          name: 'commons',
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin(GLOBALS),
    new MiniCSSExtractPlugin({
      filename: 'styles/[name].css',
      chunkFilename: 'styles/[name].css',
    }),
    new ManifestResourcePlugin({
      baseDir,
      filepath: path.join(baseDir, 'config/manifest.json'),
      buildPath: path.join(baseDir, outputPath),
      publicPath: '/h5/public/',
      assets: false,
      writeToFileEmit: true,
      commonsChunk: ['runtime', 'vendors', 'commons'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        oneOf: [
          {
            resourceQuery: /layout/,
            use: [babelLoaderConfig, require.resolve('../loaders/clientLayoutLoader')],
          }, {
            use: [babelLoaderConfig],
          },
        ],
      }, {
        test: /\.css$/,
        use: [
          MiniCSSExtractPlugin.loader,
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
        test: /\.less$/,
        use: [
          MiniCSSExtractPlugin.loader,
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
            options: { javascriptEnabled: true, sourceMap: isDev, modifyVars: theme },
          },
        ],
      }, {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?(#\S*)?$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: { name: 'styles/fonts/[name].[ext]' },
      }, {
        test: /\.(png|jp(e)?g|gif)$/,
        exclude: /node_modules\/(?!(pdfjs-dist)\/).*/,
        loader: 'file-loader',
        options: { name: 'images/[name].[ext]' },
      },
    ],
  },
  resolve: {
    extensions: ['.jsx', '.js'],
    modules: ['node_modules'].concat(moduleAliases.webpack.root),
    alias: moduleAliases.webpack.alias,
  },
};
