/* eslint require-yield: "off", no-console: "off" */

import co from 'co';
import path from 'path';
import request from 'superagent';
import ProgressBar from 'progress';
import fs from 'fs';
import pkg from '../package.json';

const distDir = path.resolve(__dirname, '../dist');
const buildTimestamp = fs.readFileSync(path.join(distDir, 'buildtime.txt'));
const fileName = `${pkg.name}-${pkg.version}-${buildTimestamp}.zip`;
const file = path.join(distDir, fileName);

co(function* uploadReleaseFile() {
  const fileSize = fs.statSync(file).size;
  const fileStream = fs.createReadStream(file);
  const bar = new ProgressBar('上传部署包: :bar :percent :elapseds', {
    total: fileSize,
    width: 50,
    complete: '█',
    incomplete: '░',
  });

  fileStream.on('data', (chunk) => {
    bar.tick(chunk.length);
  });

  request.post('')
    .attach('stream', fileStream)
    .end((err, res) => {
      if (!err && res.ok) {
        console.log(`部署包上传OSS完成: ${fileName}`);
        process.exit(0);
      } else if (err) {
        console.log('error: %s', err);
      } else {
        console.log('error: %s', res.text);
      }
      process.exit(1);
    });
}).catch((err) => {
  console.log(err, '部署包上传OSS失败，请重试！');
});
