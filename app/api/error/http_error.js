// 解析axios错误信息
class HTTPError extends Error {
  constructor(err) {
    super();

    const { data = {} } = err.response;

    this.code = -1;
    this.data = data;
    this.message = data.msg || err.response.statusText;
    this.name = 'HTTP ERROR';
    this.status = err.response.status;
  }
}

module.exports = HTTPError;
