// const axios = require('axios');

class ConfigManager {
  constructor(options) {
    const { url } = options;

    this.url = url;
  }

  async fetch() {
    // const { data } = await axios.get(this.url);
    // this.config = {
    // };
  }

  normalizeConfigKey(key, module) {
    const regex = new RegExp(`^${module}.`);
    return key.replace(regex, "");
  }

  get(module) {
    if (!module) {
      return this.config;
    }

    if (!this.config) {
      return null;
    }

    const config = {};
    Object.keys(this.config).forEach(k => {
      if (k.indexOf(module) === 0) {
        const key = this.normalizeConfigKey(k, module);
        config[key] = this.config[k];
      }
    });

    return config;
  }

  mergeConfigToApp(app) {
    Object.assign(
      app.config.externalAPI.gateway,
      app.configCenter.get("gateway")
    );
    app.config.keys = app.configCenter.get("frontend").cookieKey;
  }

  async updateConfigToApp(app) {
    // await this.fetch();
    // this.mergeConfigToApp(app);
  }
}

ConfigManager.createConfigManager = async (config, app) => {
  const configManager = new ConfigManager(config);
  // await configManager.fetch();

  app.beforeStart(async () => {
    // configManager.mergeConfigToApp(app);
  });

  return configManager;
};

module.exports = ConfigManager;
