const process = require('process');
const { fork } = require('child_process');
const path = require('path');

const constants = require('./constants');

class BuildServer {
  constructor(agent, config) {
    this.agent = agent;
    this.config = config;
    this.debugPort = config.debugPort || 5900;
    this.buildProcesses = [];

    if (!Array.isArray(config.webpackConfigList)) {
      this.config.webpackConfigList = [ config.webpackConfigList ];
    }
  }

  start() {
    const webpackConfigList = this.config.webpackConfigList;
    webpackConfigList.forEach((webpackConfigPath, index) => {
      const option = {
        port: this.config.port,
      };
      const cfg = require(webpackConfigPath);

      if (cfg.target !== 'web') {
        option.port = this.config.port + 1 + index;
      }
      this.createBuildProcess(webpackConfigPath, cfg, option);
    });

    this.agent.messenger.on(constants.MESSENGER_WEBPACK_BUILD_STATE, () => {
      const state = this.checkBuildState();
      if (state) {
        this.agent.messenger.sendToApp(constants.MESSENGER_WEBPACK_BUILD_STATE, { state });
      }
    });

  }

  checkBuildState() {
    return this.buildProcesses.length > 0 && this.buildProcesses.every(bp => bp.completed);
  }

  createBuildProcess(webpackConfigPath, webpackConfig, option) {
    let execArgv = process.execArgv;
    if (this.agent.options && this.agent.options.isDebug) {
      execArgv = process.execArgv.concat([ `--inspect-port=${this.debugPort++}`]);
    }
    const sub = fork(path.join(__dirname, 'server-process.js'), [], { execArgv });
    const buildProcess = { instance: sub, completed: false };
    this.buildProcesses.push(buildProcess);

    sub.on('message', m => {
      if (m.action === 'file') {
        this.agent.messenger.sendToApp(constants.MESSENGER_WEBPACK_MEMORY_FILE_CONTENT, {
          filePath: m.filePath,
          fileContent: m.fileContent,
        });
      } else if (m.action === 'done') {
        buildProcess.completed = true;
        const state = this.checkBuildState();
        if (state) {
          this.agent.messenger.sendToApp(constants.MESSENGER_WEBPACK_BUILD_STATE, { state });
        }
      }
    });

    sub.send({
      action: 'build',
      webpackConfigPath,
      option,
    });

    this.agent.messenger.on(constants.MESSENGER_WEBPACK_READ_MEMORY_FILE, data => {
      if (data.target === webpackConfig.target) {
        sub.send({ action: 'file', filePath: data.filePath });
      }
    });
  }
}

module.exports = BuildServer;
