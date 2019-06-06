const axios = require('axios');
const queryString = require('query-string');

class BaseAPI {
  constructor(config) {
    const { baseURL, defaultOptions } = config;

    const httpclient = axios.create({ baseURL, ...defaultOptions });

    this.payloadTransformers = [];
    this.httpclient = httpclient;
    this.config = config;
  }

  registerPayloadTransformer(transformer) {
    if (this.payloadTransformers.indexOf(transformer) === -1) {
      this.payloadTransformers.push(transformer);
    }
  }

  removePayloadTransformer(transformer) {
    const index = this.payloadTransformers.indexOf(transformer);
    if (index !== -1) {
      this.payloadTransformers.splice(index, 1);
    }
  }

  async transformRequestPayload(payload, options) {
    let result = payload;
    for (let i = 0; i < this.payloadTransformers.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const transformer = await this.payloadTransformers[i];
      result = transformer(payload, options);
    }

    return result;
  }

  normalizeContentyType(headers) {
    const contentType = (headers && headers['Content-Type']);
    return contentType || 'application/x-www-form-urlencoded';
  }

  curl(path, options = {}) {
    const { defaultOptions } = this.config;
    const finalOptions = Object.assign({
      url: path,
    }, defaultOptions, options);
    return this.httpclient(finalOptions);
  }

  async post(path, data, options = {}) {
    data = await this.transformRequestPayload(data, options);
    const contentType = this.normalizeContentyType(options.headers);
    switch (contentType) {
      case 'application/x-www-form-urlencoded':
        data = queryString.stringify(data);
        break;
      case 'application/json':
        data = JSON.stringify(data);
        break;
      default:
        break;
    }
    return this.curl(path, {
      ...options,
      method: 'POST',
      data,
    });
  }

  async get(path, data, options = {}) {
    data = await this.transformRequestPayload(data, options);
    return this.curl(path, {
      ...options,
      method: 'GET',
      params: data,
    });
  }
}

BaseAPI.IS_NODE = typeof window === 'undefined';

module.exports = BaseAPI;
