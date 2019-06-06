class BusinessError extends Error {
  constructor(err) {
    super();

    const { code, msg } = err;
    const name = 'GATEWAY ERROR';

    this.code = code;
    this.data = err;
    this.message = `[${name}] code: ${code}, message: ${msg}`;
    this.name = name;
    this.status = 200;
  }
}

module.exports = BusinessError;
