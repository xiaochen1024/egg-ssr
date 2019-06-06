import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import cloneDeep from 'lodash/cloneDeep';
import commandLineArgs from 'command-line-args';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import StatsPlugin from 'stats-webpack-plugin';
import MiniCSSExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import _ from 'lodash';

import webpackBaseConfig from './webpackBaseConfig';

const HASH_LENGTH = 8;

const optionDefinitions = [
  { name: 'analyze', type: Boolean, defaultValue: false },
  { name: 'stats', type: Boolean, defaultValue: false },
];
const options = commandLineArgs(optionDefinitions);
const baseConfig = cloneDeep(webpackBaseConfig);
const plugins = [
  new MiniCSSExtractPlugin({
    filename: `styles/[name].[contenthash:${HASH_LENGTH}].css`,
    chunkFilename: `styles/[name].[contenthash:${HASH_LENGTH}].css`,
  }),
  new webpack.HashedModuleIdsPlugin(),
];

if (options.analyze) {
  plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'server',
    analyzerHost: '127.0.0.1',
    analyzerPort: '8888',
    openAnalyzer: false,
  }));
}

if (options.stats) {
  plugins.push(new StatsPlugin('stats.json', { chunkModules: true }));
}

let finalConfig = baseConfig; // eslint-disable-line import/no-mutable-exports

// Merge common configuration
finalConfig = webpackMerge(finalConfig, {
  output: {
    filename: `scripts/[name].[contenthash:${HASH_LENGTH}].js`,
    chunkFilename: `scripts/[name].[contenthash:${HASH_LENGTH}].js`,
  },
  mode: 'production',
  parallelism: 1,
  profile: options.stats,
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
});

// Merge plugins
finalConfig = webpackMerge({
  customizeArray(a, b, key) {
    if (key === 'plugins') {
      return _.uniqBy(
        [...b, ...a],
        plugin => plugin.constructor || plugin.constructor.name,
      );
    }

    return undefined;
  },
})(finalConfig, { plugins });

// Merge loaders
finalConfig = webpackMerge.smart(finalConfig, {
  module: {
    rules: [
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?(#\S*)?$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: `styles/fonts/[name].[hash:${HASH_LENGTH}].[ext]`,
        },
      }, {
        test: /\.(png|jp(e)?g|gif)$/,
        loader: 'file-loader',
        exclude: /node_modules\/(?!(pdfjs-dist)\/).*/,
        options: {
          name: `images/[name].[hash:${HASH_LENGTH}].[ext]`,
        },
      },
    ],
  },
});

export default finalConfig;
