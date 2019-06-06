const fs = require('fs');

const BuildServer = require('./lib/server');

module.exports = (agent) => {
  agent.messenger.on('egg-ready', () => {
    const config = agent.config.webpack;
    new BuildServer(agent, config).start();
  });

  agent.ready(() => {
    const { manifest } = agent.config.reactssr;
    try {
      if (fs.existsSync(manifest)) {
        fs.unlinkSync(manifest);
      }
    } catch (e) {
      process.stdout.write(e);
    }
  });
};
