const cookieOptionsFactory = require("../util/cookieOptions");

const maxAge = 3 * 31 * 24 * 3600 * 1000; // 配置及渠道相关信息保存3个月
const cookieOptions = cookieOptionsFactory({ maxAge });

module.exports = () =>
  async function parseConfig(ctx, next) {
    const { req, locals, cookies, query, response, request } = ctx;

    locals.globalInfo = {
      resourceURL: locals.resourceURL,
      apiConfig: locals.apiConfig
    };

    await next();
  };
