const constants = require('./constants');

class FileSystem {

  constructor(app) {
    this.app = app;
  }

  readWebpackMemoryFile(filePath, fileName, target = 'node') {
    return new Promise(resolve => {
      this.app.messenger.sendToAgent(constants.MESSENGER_WEBPACK_READ_MEMORY_FILE, {
        filePath,
        fileName,
        target,
      });

      const fileContentListener = data => {
        if (filePath === data.filePath) {
          resolve(data.fileContent);
          this.app.messenger.removeListener(constants.MESSENGER_WEBPACK_MEMORY_FILE_CONTENT, fileContentListener);
        }
      };

      this.app.messenger.on(constants.MESSENGER_WEBPACK_MEMORY_FILE_CONTENT, fileContentListener);
    });
  }
}

module.exports = FileSystem;
