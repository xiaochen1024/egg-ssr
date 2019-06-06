import fs from 'fs';
import path from 'path';
import OSS from 'ali-oss';
import co from 'co';
import chalk from 'chalk';
import pkg from '../package.json';

const walkSync = (dir, filelist) => {
  const files = fs.readdirSync(dir);
  let fList = filelist || [];
  files.forEach((file) => {
    const absFile = path.join(dir, file);
    if (fs.statSync(absFile).isDirectory()) {
      fList = walkSync(absFile, fList);
    } else {
      fList.push(absFile);
    }
  });
  return fList;
};

function listFilesMap(sourceDir, targetDir = '') {
  const list = walkSync(sourceDir);
  const filesMap = {};
  list.forEach((dir) => {
    const regex = new RegExp(`^${path.join(sourceDir, '/')}(.*)$`, 'g');
    const targetPath = dir.replace(
      regex,
      (match, p1) => path.join(targetDir, p1),
    );
    filesMap[dir] = targetPath;
  });

  return filesMap;
}

const client = new OSS({
  region: '',
  accessKeyId: '',
  accessKeySecret: '',
  bucket: 'static',
});

const filesMap = listFilesMap('./public');

process.stdout.write(chalk.blue('上传静态资源到CDN...\n'));
co(function* uploadStaticResource() {
  const files = Object.keys(filesMap);

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const cdnFile = path.join(pkg.cdnAliasName, filesMap[file]);
    yield client.put(cdnFile, file);
    process.stdout.write(`  ${filesMap[file]} 🚚\n`);
  }
}).then(() => {
  process.stdout.write(chalk.green('上传静态资源到CDN成功\n'));
  process.exit(0);
}).catch(() => {
  process.stderr.write(chalk.red('上传静态资源到CDN失败\n'));
  process.exit(1);
});
