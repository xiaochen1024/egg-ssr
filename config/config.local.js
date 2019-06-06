const path = require("path");
const ip = require("ip");

exports.configCenter = {
  client: {
    url:
      ""
  }
};

exports.development = {
  ignoreDirs: ["app/web", "public", "config"]
};

exports.webpack = {
  webpackConfigList: [
    path.join(__dirname, "../webpack/client/webpackDevConfig"),
    path.join(__dirname, "../webpack/server/webpackDevConfig")
  ],
  proxy: {
    match: /^\/h5\/public\//
  }
};

const localIP = ip.address();
const domainWhiteList = [""];
[9000, 9001, 9002].forEach(port => {
  domainWhiteList.push(`http://localhost:${port}`);
  domainWhiteList.push(`http://127.0.0.1:${port}`);
  domainWhiteList.push(`http://${localIP}:${port}`);
});
exports.security = { domainWhiteList };

exports.resourceURL = {
  h5root: "http://localhost:4001/h5",
  cdn: "http://localhost:4001/h5"
};

// baseInteranlURL, baseURL通过ConfigManager从配置中心获取
exports.externalAPI = {
  gateway: {
    baseURL: ""
  }
};
