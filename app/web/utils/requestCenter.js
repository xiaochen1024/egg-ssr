import { Toast } from 'antd-mobile';
import shortId from 'shortid';

import BusinessError from 'api/error/business_error';
import HTTPError from 'api/error/http_error';
import configuration from 'utils/globalConfiguration';
import storage from 'utils/storage';

class RequestCenter {
  requestMap = new Map();

  async listen(requestPromise, options = {}) {
    const opts = Object.assign({
      showLoading: false,
      loadingText: '加载中...',
      showError: true,
      errorText: '系统繁忙，请稍后重试',
      hideLoadingTip: null,
      hideErrorTip: null,
    }, options);
    const id = shortId.generate();

    this.requestMap.set(id, opts);

    if (opts.showLoading) {
      opts.hideLoadingTip = Toast.loading(opts.loadingText);
    }

    try {
      const result = await requestPromise;
      return result;
    } catch (err) {
      if (opts.showError) {
        if (err instanceof BusinessError) {
          opts.hideErrorTip = Toast.fail(err.data.msg || opts.errorText);
        }
      }

      if (err instanceof HTTPError) {
        if (err.status === 401) {
          const { pathname, search } = window.location;
          storage.removeItem('userId');
          storage.removeItem('token');
          const baseUrl = configuration.get('resourceURL.h5root');
          const redirectUrl = `${baseUrl}/user/h5login`;
          window.location.href = `${redirectUrl}?from=${encodeURIComponent(pathname + search)}`;
        } else if (err.status === 400) {
          opts.hideErrorTip = Toast.fail(err.data.msg || err.data.errorMsg || opts.errorText);
        }
      }

      throw err;
    } finally {
      if (this.requestMap.has(id)) {
        this.requestMap.delete(id);
        opts.hideLoadingTip && opts.hideLoadingTip();
      }
    }
  }

  reset() {
    /* eslint-disable no-restricted-syntax */
    for (const opts of this.requestMap.values()) {
      opts.hideLoadingTip && opts.hideLoadingTip();
      opts.hideErrorTip && opts.hideErrorTip();
    }
    /* eslint-enable no-restricted-syntax */

    this.requestMap.clear();
  }
}

export default new RequestCenter();
