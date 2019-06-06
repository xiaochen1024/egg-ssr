const path = require('path');
const util = require('util');

module.exports = () => {
  const skipExt = ['.png', '.jpeg', '.jpg', '.ico', '.gif'];
  return async function access(ctx, next) {
    const start = new Date().getTime();
    const ip = ctx.get('X-Real-IP') || ctx.ip;
    const port = ctx.get('X-Real-Port');

    await next();

    const rs = Math.ceil(new Date().getTime() - start);

    ctx.set('X-Response-Time', rs);

    const ext = path.extname(ctx.url).toLocaleLowerCase();
    const isSkip = skipExt.indexOf(ext) !== -1 && ctx.status < 400;

    if (!isSkip) {
      const protocol = ctx.protocol.toUpperCase();
      const { method, url, status, length = '-' } = ctx; // eslint-disable-line object-curly-newline
      const referrer = ctx.get('referrer') || '-';
      const ua = ctx.get('user-agent') || '-';
      const serverTime = ctx.response.get('X-Server-Response-Time') || '-';
      const message = util.format(
        '[access] %s:%s - %s %s %s/%s %s %s %sms %s %s',
        ip, port, method, url, protocol, status, length, referrer, rs, serverTime, ua,
      );
      ctx.logger.info(message);
    }
  };
};
