const merge = require("lodash/merge");

const BaseAPI = require("./base_api");
const BusinessError = require("./error/business_error");
const HTTPError = require("./error/http_error");

const { IS_NODE } = BaseAPI;

function formatResponseLog(response) {
  const { data, config, status } = response;
  const log = `${
    config.url
  } ${config.method.toUpperCase()} ${status} ${JSON.stringify(data)}`;
  return log;
}

class BaseINDEXAPI extends BaseAPI {
  static parseRequestConfig(ctx) {
    let config = {};

    // 服务端实例化会传入ctx，否则为客户端实例化
    if (BaseAPI.IS_NODE) {
      const {
        baseURL,
        defaultOptions
      } = ctx.app.config.externalAPI.gateway;

      const options = merge({}, defaultOptions);
      const cookieHeader = BaseINDEXAPI.createCookieHeader(ctx);

      if (options.headers) {
        const defaultCookie = options.headers.Cookie;
        if (defaultCookie) {
          options.headers.Cookie = defaultCookie + cookieHeader.Cookie;
        } else {
          Object.assign(options.headers, cookieHeader);
        }
      } else {
        Object.assign(options, { headers: cookieHeader });
      }

      config = {
        baseURL,
        defaultOptions: options
      };
    } else {
      config = window.__API_CONFIG__.gateway; // eslint-disable-line no-underscore-dangle
    }

    return config;
  }

  static createCookieHeader(ctx) {
    const cookieKeys = ["userId", "platform", "channel", "token"];
    const { cookies } = ctx;
    let cookieStr = "";
    cookieKeys.forEach(k => {
      const v = cookies.get(k, { signed: false });
      if (v) {
        cookieStr += `${k}=${v};`;
      }
    });
    return { Cookie: cookieStr };
  }

  constructor(ctx) {
    const config = BaseINDEXAPI.parseRequestConfig(ctx);

    super(config);

    this.ctx = ctx;
  }

  async curl(path, options = {}) {
    try {
      const result = await super.curl(path, options);
      const { data: resData } = result;

      if (resData.code !== 0) {
        throw new BusinessError(resData);
      }

      if (IS_NODE) {
        this.ctx.logger.debug(formatResponseLog(result));
      }

      return resData.data;
    } catch (err) {
      // 处理HTTP错误
      if (err.response && err.request) {
        if (IS_NODE) {
          this.ctx.logger.error(formatResponseLog(err.response));
        }
        throw new HTTPError(err);
      }

      throw err;
    }
  }
}

module.exports = BaseINDEXAPI;
