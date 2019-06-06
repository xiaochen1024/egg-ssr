class GlobalConfiguration {
  static instance = null;

  configuration = null;

  constructor() {
    if (GlobalConfiguration.instance) {
      return GlobalConfiguration.instance;
    }

    GlobalConfiguration.instance = this;
  }

  set(config) {
    this.configuration = config;
  }

  get(key) {
    if (!this.configuration) {
      throw Error('全局配置未初始化');
    }

    const keyPath = key.split('.');
    let value = this.configuration;
    for (let i = 0; i < keyPath.length; i++) {
      value = value[keyPath[i]];
      if (!value) {
        return null;
      }
    }

    return value;
  }
}

const singleton = new GlobalConfiguration();

export default singleton;
