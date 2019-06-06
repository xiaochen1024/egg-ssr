import axios from 'axios';
import queryString from 'query-string';
import { Toast } from 'antd-mobile';

axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.withCredentials = true;

let showLoadingCount = 0;
let showErrorMessage = false;

axios.interceptors.request.use((config) => {
  if (config.showLoading) {
    if (!showLoadingCount && !showErrorMessage) {
      Toast.loading(null, 0);
    }
    showLoadingCount += 1;
  }
  return config;
}, error => Promise.reject(error));

axios.interceptors.response.use(
  (response) => {
    const { config, data: result } = response;

    if (config.showLoading) {
      showLoadingCount -= 1;
      showLoadingCount <= 0 && !showErrorMessage && Toast.hide();
    }
    return result.data;
  },
  (error) => {
    const { config, response } = error;
    const { status } = response;

    if (config.showLoading) {
      showLoadingCount -= 1;
      showLoadingCount <= 0 && !showErrorMessage && Toast.hide();
    }

    if (status === 403 || status === 401) {
      return Promise.reject(response);
    }

    if (config.showError) {
      showErrorMessage = true;
      Toast.fail(response.data.errorMsg, 3, () => {
        showErrorMessage = false;
        // 多请求并发时，部分请求出错显示错误提示后，如果仍有请求加载中，
        // 则恢复Loading状态框
        if (config.showLoading && showLoadingCount > 0) {
          Toast.loading(null, 0);
        }
      });
    }
    return Promise.reject(response);
  },
);

function normalizeContentyType(headers) {
  const contentType = (headers && headers['Content-Type']);
  return contentType || 'application/x-www-form-urlencoded';
}

export default {
  post(url, params, config) {
    config = Object.assign({ showError: true, showLoading: true }, config);
    const contentType = normalizeContentyType(config.headers);

    switch (contentType) {
      case 'application/x-www-form-urlencoded':
        params = queryString.stringify(params);
        break;
      case 'application/json':
        params = JSON.stringify(params);
        break;
      default:
        break;
    }

    return axios.post(url, params, config);
  },

  get(url, params, config) {
    config = Object.assign({ showError: true, showLoading: true }, config);
    return axios.get(url, { params }, config);
  },

  put(url, params, config) {
    config = Object.assign({ showError: true }, config);
    return axios.put(url, queryString.stringify(params), config);
  },
};
