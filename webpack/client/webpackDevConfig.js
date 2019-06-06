import cloneDeep from 'lodash/cloneDeep';
import webpackMerge from 'webpack-merge';
import webpackBaseConfig from './webpackBaseConfig';

const baseConfig = cloneDeep(webpackBaseConfig);

export default webpackMerge.smart(baseConfig, {
  mode: 'development',
  devtool: 'source-map',
  // devtool: false,
});
