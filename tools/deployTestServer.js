/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import process from 'process';
import { Client } from 'ssh2';
import ora from 'ora';
import inquirer from 'inquirer';
import pkg from '../package.json';

const SSH_DIR = path.resolve(process.env.HOME, './.ssh');
const DIST_DIR = path.resolve(__dirname, '../dist');
const SERVER_DIR = '';
const BUILD_TIMESTAMP = fs.readFileSync(path.join(DIST_DIR, 'buildtime.txt'));
const DIST_FILE_NAME = `${pkg.name}-${pkg.version}-${BUILD_TIMESTAMP}.zip`;
const DEPLOY_CONFIG_FILE = `${__dirname}/../.deployrc`;

class ConfigurationBuilder {
  static async getDeployConfig() {
    let config = {};
    const sshKeyPath = process.env.SSH_KEY_FILE;
    const sshPassphrase = process.env.SSH_PASSPHRASE;

    if (sshKeyPath && sshPassphrase) {
      config = {
        privateKeyFile: sshKeyPath,
        privateKeyPassphrase: sshPassphrase,
      };
      return config;
    }

    try {
      const configFile = fs.readFileSync(DEPLOY_CONFIG_FILE, 'utf8');
      config = JSON.parse(configFile);
      return config;
    } catch (ex) {
      config = await ConfigurationBuilder.configureSSHKeys();
      fs.writeFileSync(DEPLOY_CONFIG_FILE, JSON.stringify(config));
      return config;
    }
  }

  static async configureSSHKeys() {
    const files = fs.readdirSync(SSH_DIR);

    if (files.length === 0) {
      console.log('💔 未找到有效的SSH Key，请先配置SSH Key！');
      return null;
    }

    const sshKeys = [];
    files.forEach((f) => {
      const stats = fs.statSync(path.join(SSH_DIR, f));
      if (
        !stats.isDirectory()
        && !/(\.pub|config|known_hosts|authorized_keys)$/.test(f)
      ) {
        sshKeys.push(f);
      }
    });

    const prompt = inquirer.createPromptModule();
    const sshConfig = await prompt([{
      type: 'list',
      name: 'sshKey',
      message: '请选择连接测试服务使用的SSH私钥：',
      choices: sshKeys,
    }, {
      type: 'password',
      name: 'sshPassphrase',
      message: '请输入SSH私钥的密码：',
      validate: input => input.length > 0,
    }]);

    return {
      privateKeyFile: path.join(SSH_DIR, sshConfig.sshKey),
      privateKeyPassphrase: sshConfig.sshPassphrase,
    };
  }
}

class Deployer {
  server = {
    debug: true,
    host: '',
    port: 22,
    username: 'root',
  };

  tunnel = {
    debug: true,
    host: '',
    port: 22,
    username: 'root',
  };

  constructor(sshKeyFile, sshPassphrase) {
    this.sshKeyFile = sshKeyFile;
    this.sshPassphrase = sshPassphrase;
    this.conn = new Client();
  }

  onReady() {
    console.log('\n🚀 已连接至测试服务器');
    this.uploadArchive();
  }

  async deploy() {
    const tunnel = new Client();
    const deployCfg = await ConfigurationBuilder.getDeployConfig();
    const privateKeyFile = fs.readFileSync(deployCfg.privateKeyFile);
    const serverCfg = this.server;
    const tunnelCfg = Object.assign({
      privateKey: privateKeyFile,
      passphrase: deployCfg.privateKeyPassphrase,
    }, this.tunnel);

    tunnel.on('ready', () => {
      console.log('💫 已连接至跳板服务器');
      tunnel.exec(`nc ${serverCfg.host} ${serverCfg.port}`, (err, stream) => {
        this.conn
          .on('ready', () => this.onReady())
          .connect({
            sock: stream,
            username: serverCfg.username,
            passphrase: deployCfg.privateKeyPassphrase,
            privateKey: privateKeyFile,
          });
      });
    });

    tunnel.connect(tunnelCfg);
  }

  uploadArchive() {
    this.conn.sftp((err, sftp) => {
      if (err) {
        console.log('上传部署包至测试环境失败：%s', err);
        process.exit(2);
      }

      const spinner = ora('正在上传部署包至测试环境...');
      spinner.start();

      const readStream = fs.createReadStream(path.join(DIST_DIR, DIST_FILE_NAME));
      const writeStream = sftp.createWriteStream(path.join(SERVER_DIR, DIST_FILE_NAME));

      writeStream.on('close', () => {
        spinner.stop();
        console.log('\n🍺 上传部署包至测试环境完成');
        sftp.end();
        this.extractArchive();
      });

      readStream.pipe(writeStream);
    });
  }

  extractArchive() {
    this.conn.exec(
      `unzip -o ${path.join(SERVER_DIR, DIST_FILE_NAME)} -d ${path.join(SERVER_DIR, `${pkg.name}`)}`,
      (err, stream) => {
        console.log('\n🐶 正在解压测试环境部署包...');
        if (err) throw err;

        stream.on('close', (code) => {
          if (code === 0) {
            console.log('🍺 解压测试环境部署包成功');
            this.restartService();
          } else {
            console.log('😂 解压测试环境部署包失败');
            this.conn.end();
            process.exit(2);
          }
        }).on('data', (data) => {
          data.toString(); // 消费返回数据，避免阻塞
        }).stderr.on('data', (data) => {
          process.stdout.write(data.toString());
        });
      },
    );
  }

  restartService() {
    const commandStr = `cd ${path.join(SERVER_DIR, `${pkg.name}`)}/\nsh stop.sh\nsh start.sh\n`;

    this.conn.exec(commandStr, (err, stream) => {
      console.log('\n🐶 正在重启H5测试服务器...');
      if (err) throw err;

      stream.on('close', (code) => {
        if (code === 0) {
          console.log('🍺 重启H5测试服务器完成');
          this.conn.end();
          process.exit(0);
        } else {
          console.log('😂 重启H5测试服务器失败');
          this.conn.end();
          process.exit(2);
        }
      }).on('data', (data) => {
        process.stdout.write(data.toString());
      }).stderr.on('data', (data) => {
        process.stdout.write(data.toString());
      });
    });
  }
}

const deployer = new Deployer();
deployer.deploy();
