const cookieOptionsFactory = require('../util/cookieOptions');

const maxAge = 3 * 31 * 24 * 3600 * 1000; // 授权信息保存3个月
const options = cookieOptionsFactory({ maxAge });

module.exports = () => async function passport(ctx, next) {
  const { req, cookies } = ctx;
  const { userId, token } = req.query;
  if (userId && token) {
    cookies.set('userId', userId, options);
    cookies.set('token', token, options);
  }

  await next();
};
