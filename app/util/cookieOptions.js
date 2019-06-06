const _ = require('lodash');
const process = require('process');

const env = process.env.NODE_ENV;
const release = process.env.EGG_SERVER_ENV;

module.exports = function cookieOptions(option) {
  const defaultOptions = {
    domain: '',
    secure: env === 'production' && release === 'prod',
    expires: 0,
    httpOnly: true,
    path: '/',
    signed: false,
  };

  return _.merge({}, defaultOptions, option);
};
