const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const _ = require('lodash');
const mutexify = require('mutexify');

const lock = mutexify();

function ManifestPlugin(opts) {
  this.opts = _.assign(
    {
      basePath: '',
      absPath: '',
      fileName: 'manifest.json',
      commonsChunk: [],
      transformExtensions: /^(gz|map)$/i,
      asset: true,
      writeToFileEmit: false,
      seed: null,
      filter: null,
      map: null,
      generate: null,
      sort: null,
    },
    opts || {}
  );
}

ManifestPlugin.prototype.getFileType = function(str) {
  str = str.replace(/\?.*/, '');
  const split = str.split('.');
  let ext = split.pop();
  if (this.opts.transformExtensions.test(ext)) {
    ext = split.pop() + '.' + ext;
  }
  return ext;
};

// old version not include publicPath
ManifestPlugin.prototype.normalizeFile = function(manifest, prefix) {
  const normalizeManifest = {};
  Object.keys(manifest).forEach(key => {
    normalizeManifest[key] = manifest[key].replace(prefix, '');
  });
  return normalizeManifest;
};

ManifestPlugin.prototype.normalize = function(manifest) {
  const normalizeManifest = {};
  Object.keys(manifest).forEach(key => {
    const normalizeKey = key.replace(/^\\/g, '').replace(/\\/g, '/');
    const normalizeValue = manifest[key].replace(/\\/g, '/');
    if (this.opts.proxy) {
      normalizeManifest[normalizeKey] = normalizeValue.replace(
        this.opts.host,
        ''
      );
    } else {
      normalizeManifest[normalizeKey] = normalizeValue;
    }
  });
  return normalizeManifest;
};

ManifestPlugin.prototype.isMatch = (regexArray, strMatch, defaultMatch = false) => {
  if (!regexArray || (Array.isArray(regexArray) && regexArray.length === 0)) {
    return defaultMatch;
  }
  regexArray = Array.isArray(regexArray) ? regexArray : [ regexArray ];
  return regexArray.some(item => new RegExp(item, '').test(strMatch));
};

ManifestPlugin.prototype.getDeps = function(compiler, manifest, commonsChunk) {
  const deps = {};
  const commonChunkScript = [];
  const commonChunkCss = [];
  commonsChunk.forEach(item => {
    if (typeof item === 'string') {
      const jsKey = `${item}.js`;
      const cssKey = `${item}.css`;
      manifest[jsKey] && commonChunkScript.push(manifest[jsKey]);
      manifest[cssKey] && commonChunkCss.push(manifest[cssKey]);
    }
  });
  const webpackConfig = compiler.options;
  const entryNames = Object.keys(webpackConfig.entry);
  entryNames.forEach(entryName => {
    const dllScript = [];
    const dllCss = [];
    const pageName = entryName.replace(/\.js$/, '');
    const isCommonsChunk = commonsChunk.find(chunk => {
      return (
        chunk === pageName ||
        (typeof chunk === 'object' && chunk.name === pageName)
      );
    });
    commonsChunk.forEach(dll => {
      if (typeof dll === 'object') {
        if (
          !isCommonsChunk &&
          this.isMatch(dll.include, pageName, true) &&
          !this.isMatch(dll.exclude, pageName, false)
        ) {
          const jsKey = `${dll.name}.js`;
          const cssKey = `${dll.name}.css`;
          manifest[jsKey] && dllScript.push(manifest[jsKey]);
          manifest[cssKey] && dllCss.push(manifest[cssKey]);
        }
      }
    });
    if (!isCommonsChunk) {
      const js = dllScript
        .concat(commonChunkScript)
        .concat(manifest[`${pageName}.js`] || []);
      const css = dllCss
        .concat(commonChunkCss)
        .concat(manifest[`${pageName}.css`] || []);
      deps[`${pageName}.js`] = { js, css };
    }
  });
  return deps;
};

ManifestPlugin.prototype.getResource = function(compiler, manifest, publicPath) {
  const buildPath = this.opts.buildPath
    .replace(this.opts.baseDir, '')
    .replace(/^\//, '');
  const normalizeManifest = this.normalize(manifest);
  const manifestDll = this.opts.manifestDll;
  const dllConfig = this.opts.dllConfig;
  const dllDir = this.opts.dllDir;
  const dllChunk = this.opts.dllChunk;
  if (manifestDll && typeof manifestDll === 'boolean') {
    return this.normalizeFile(normalizeManifest, this.opts.host);
  }
  let commonsChunk = [];
  if (dllChunk) {
    // for webpack4 4.2.0
    const dll = dllChunk.dll;
    const names = dllChunk.names;
    const chunks = dllChunk.chunks;
    chunks.forEach(chunk => {
      normalizeManifest[chunk.id] = chunk.outputPath;
    });
    commonsChunk = [].concat(dll);
  }
  commonsChunk = commonsChunk.concat(this.opts.commonsChunk);
  publicPath = this.opts.proxy
    ? publicPath.replace(this.opts.host, '')
    : publicPath;
  const depsManifest = this.getDeps(compiler, normalizeManifest, commonsChunk);
  return Object.assign({}, normalizeManifest, {
    deps: depsManifest,
    info: { publicPath, buildPath, mapped: true },
  });
};

ManifestPlugin.prototype.apply = function(compiler) {
  const seed = this.opts.seed || {};
  const moduleAssets = {};
  const moduleAsset = function(module, file) {
    moduleAssets[file] = path.join(
      path.dirname(file),
      path.basename(module.userRequest)
    );
  };

  const emit = function(compilation, compileCallback) {
    const publicPath = compilation.options.output.publicPath;
    const stats = compilation.getStats().toJson();

    let files = compilation.chunks.reduce(
      function(files, chunk) {
        return chunk.files.reduce(
          function(files, path) {
            let name = chunk.name ? chunk.name : null;

            if (name) {
              name = name + '.' + this.getFileType(path);
            } else {
              // For nameless chunks, just map the files directly.
              name = path;
            }

            return files.concat({
              path,
              chunk,
              name,
              isInitial: chunk.isOnlyInitial(),
              isChunk: true,
              isAsset: false,
              isModuleAsset: false,
            });
          }.bind(this),
          files
        );
      }.bind(this),
      []
    );

    // module assets don't show up in assetsByChunkName.
    // we're getting them this way;
    files = stats.assets.reduce(function(files, asset) {
      const name = moduleAssets[asset.name];
      if (name) {
        return files.concat({
          path: asset.name,
          name,
          isInitial: false,
          isChunk: false,
          isAsset: true,
          isModuleAsset: true,
        });
      }

      const isEntryAsset = asset.chunks.length > 0;
      if (isEntryAsset) {
        return files;
      }

      return files.concat({
        path: asset.name,
        name: asset.name,
        isInitial: false,
        isChunk: false,
        isAsset: true,
        isModuleAsset: false,
      });
    }, files);

    files = files.filter(function(file) {
      // Don't add hot updates to manifest
      return file.path.indexOf('hot-update') === -1;
    });

    // Append optional basepath onto all references.
    // This allows output path to be reflected in the manifest.
    if (this.opts.basePath) {
      files = files.map(
        function(file) {
          file.name = this.opts.basePath + file.name;
          return file;
        }.bind(this)
      );
    }

    if (publicPath) {
      // Similar to basePath but only affects the value (similar to how
      // output.publicPath turns require('foo/bar') into '/public/foo/bar', see
      // https://github.com/webpack/docs/wiki/configuration#outputpublicpath
      files = files.map(function(file) {
        file.path = publicPath + file.path;
        return file;
      });
    }

    files = files.map(file => {
      file.name = file.name.replace(/\\/g, '/');
      file.path = file.path.replace(/\\/g, '/');
      return file;
    });

    if (this.opts.filter) {
      files = files.filter(this.opts.filter);
    }

    if (this.opts.map) {
      files = files.map(this.opts.map);
    }

    if (this.opts.sort) {
      files = files.sort(this.opts.sort);
    }

    let manifest;
    if (this.opts.generate) {
      manifest = this.opts.generate(seed, files);
    } else {
      manifest = files.reduce(function(manifest, file) {
        manifest[file.name] = file.path;
        return manifest;
      }, seed);
    }

    const resource = this.getResource(compiler, manifest, publicPath);
    const json = JSON.stringify(resource, null, 2);
    const outputFolder = compilation.options.output.path;
    const outputFile = this.opts.filepath
      ? this.opts.filepath
      : path.resolve(compilation.options.output.path, this.opts.fileName);
    const outputName = this.opts.filepath
      ? path.basename(this.opts.filepath)
      : path.relative(outputFolder, outputFile);

    if (this.opts.assets) {
      compilation.assets[outputName] = {
        source() {
          return json;
        },
        size() {
          return json.length;
        },
      };
    }

    if (this.opts.writeToFileEmit) {
      fse.outputFileSync(outputFile, json);
    }

    // NOTE: make sure webpack is not writing multiple manifests simultaneously
    lock(function(release) {
      if (compiler.hooks) {
        compiler.hooks.afterEmit.tap('ManifestResourcePlugin', function(
          compilation
        ) {
          release();
        });
      } else {
        compiler.plugin('after-emit', function(compilation, cb) {
          release();
          cb();
        });
        compilation.applyPluginsAsync(
          'webpack-manifest-resource-plugin-after-emit',
          manifest,
          compileCallback
        );
      }
    });
  }.bind(this);

  if (compiler.hooks) {
    compiler.hooks.compilation.tap('ManifestResourcePlugin', function(
      compilation
    ) {
      compilation.hooks.moduleAsset.tap('ManifestResourcePlugin', moduleAsset);
    });
    compiler.hooks.emit.tap('ManifestResourcePlugin', emit);
  } else {
    compiler.plugin('compilation', function(compilation) {
      compilation.plugin('module-asset', moduleAsset);
    });
    compiler.plugin('emit', emit);
  }
};

module.exports = ManifestPlugin;
