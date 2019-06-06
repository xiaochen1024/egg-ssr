const os = require('os');

const workers = Number(process.argv[2] || os.cpus().length);
require('egg').startCluster({
  baseDir: __dirname,
  workers,
  port: process.env.PORT,
});
