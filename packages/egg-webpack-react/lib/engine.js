const FileSystem = require('./filesystem');
module.exports = app => {
  return Object.assign({}, { fileSystem: new FileSystem(app) });
};
