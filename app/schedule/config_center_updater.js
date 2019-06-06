const { Subscription } = require('egg');

class ConfigCenterUpdater extends Subscription {
  static get schedule() {
    return {
      interval: '60s',
      type: 'worker',
    };
  }

  async subscribe() {
    const { ctx } = this;
    // await ctx.app.configCenter.updateConfigToApp(ctx.app);
  }
}

module.exports = ConfigCenterUpdater;
