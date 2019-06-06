import rc from 'utils/requestCenter';

const monitorApis = (apis, monitorOptions = {}) => Object.keys(apis).reduce(
  (apisMonitored, apiName) => {
    const api = apis[apiName];
    apisMonitored[apiName] = new Proxy(api, {
      get(target, prop) {
        if (prop === 'curl') {
          return function curl(...args) {
            return rc.listen(target[prop](...args), monitorOptions);
          };
        }

        return target[prop];
      },
    });

    return apisMonitored;
  },
  {},
);

export default class BaseStore {
  registerAPI(apisClass, ctx) {
    const apis = Object.keys(apisClass).reduce(
      (instances, propertyName) => {
        const Clazz = apisClass[propertyName];
        const instance = new Clazz(ctx);
        instances[propertyName] = instance;
        return instances;
      },
      {},
    );

    if (ENV_IS_NODE) {
      Object.defineProperty(this, 'apis', {
        value: apis,
        writable: false,
        enumerable: false,
      });
    } else {
      const apisProxied = monitorApis(apis);

      Object.defineProperties(this, {
        apis: {
          value: apisProxied,
          writable: true,
          enumerable: false,
        },
        apisNonProxied: {
          value: apis,
          writable: true,
          enumerable: false,
        },
        slient: {
          value: () => new Proxy(this, {
            get(target, prop) {
              if (prop === 'apis') {
                return target.apisNonProxied;
              }

              return target[prop];
            },
          }),
        },
        monitor: {
          value: options => new Proxy(this, {
            get(target, prop) {
              if (prop === 'apis') {
                return monitorApis(target.apisNonProxied, options);
              }

              return target[prop];
            },
          }),
        },
      });
    }
  }
}
