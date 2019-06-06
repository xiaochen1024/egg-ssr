const path = require('path');

const root = [path.resolve(__dirname, '..')];

module.exports.babel = {
  root,
  alias: {
    project: '.',
    api: './app/api',
    framework: './app/web/framework',
    components: './app/web/components',
    constants: './app/web/constants',
    images: './app/web/images',
    stores: './app/web/stores',
    styles: './app/web/styles',
    utils: './app/web/utils',
    adapters: './app/web/adapters',
    decorators: './app/web/decorators',
  },
};

module.exports.webpack = {
  root,
  alias: {
    project: '.',
    api: 'app/api',
    framework: 'app/web/framework',
    components: 'app/web/components',
    constants: 'app/web/constants',
    images: 'app/web/images',
    stores: 'app/web/stores',
    styles: 'app/web/styles',
    utils: 'app/web/utils',
    adapters: 'app/web/adapters',
    decorators: 'app/web/decorators',
  },
};
