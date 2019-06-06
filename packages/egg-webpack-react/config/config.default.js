module.exports = () => {
  const config = {};
  config.webpack = {
    port: 9000,
    proxy: {
      host: 'http://127.0.0.1:9000', // target host that matched path will be proxy to
      match: /^\/public\//, // path pattern.
    },
    webpackConfigList: [],
  };
  return config;
};
