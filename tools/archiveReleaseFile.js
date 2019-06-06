import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import process from 'process';
import moment from 'moment';

import pkg from '../package.json';

const buildTimestamp = moment().format('YYYYMMDDHHmmss');
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const outputFilename = `${pkg.name}-${pkg.version}-${buildTimestamp}.zip`;
const buildTimestampFile = path.join(distDir, 'buildtime.txt');
const output = fs.createWriteStream(path.join(distDir, outputFilename));
const archive = archiver('zip');
const startTime = new Date().getTime();

process.stdout.write('正在打包...\n');

output.on('close', () => {
  const endTime = new Date().getTime();
  const elaspedTime = (endTime - startTime) / 1000;
  const filesize = (archive.pointer() / 1000 / 1000).toFixed(2); // MB
  fs.writeFileSync(buildTimestampFile, buildTimestamp);
  process.stdout.write(`打包完成，包大小为：${filesize}MB，耗时：${elaspedTime}s\n`);
});

archive.on('error', (err) => {
  throw err;
});

archive.on('entry', (entry) => {
  if (!entry.name.match(/^node_modules/g) && entry.type === 'file') {
    process.stdout.write(`添加文件：${entry.name}\n`);
  }
});

const timestamp = new Date();

archive.pipe(output);

const walkSync = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const absFile = path.join(dir, file);
    if (fs.statSync(absFile).isDirectory()) {
      if (file.search('web') === -1) {
        archive.directory(absFile, `./app/${file}`, { date: timestamp });
      }
    } else {
      archive.file(`app/${file}`, { date: timestamp });
    }
  });
};

const startFile = `start_${process.env.EGG_SERVER_ENV}.sh`;

archive.file('package.json', { date: timestamp });
archive.file('index.js', { date: timestamp });
archive.file('app.js', { date: timestamp });
archive.file('.yarnrc', { date: timestamp });
archive.file(startFile, { date: timestamp, name: 'start.sh' });
archive.file('stop.sh', { date: timestamp });

walkSync(path.join(__dirname, '../app'));
archive.directory('config', './config', { date: timestamp });
archive.directory('public', './public', { date: timestamp });

// 添加Node生产环境依赖
require('child_process').exec('npm ls --production --parseable', (err, stdout) => {
  if (err) throw err;

  const files = stdout.split('\n');
  files.forEach((f) => {
    const pos = f.indexOf('node_modules');
    if (pos !== -1) {
      const dir = f.substring(pos);
      process.stdout.write(`添加Node依赖：${dir}\n`);
      archive.directory(dir, true, { date: timestamp });
    }
  });

  archive.directory('node_modules/.bin', true, { date: timestamp });
  archive.finalize();
});
