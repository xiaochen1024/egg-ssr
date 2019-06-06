# webpack-manifest-resource-plugin

normalize js/css resource dependencies for [webpack-manifest-plugin](https://github.com/danethurber/webpack-manifest-plugin)


## Install


```bash
npm install --save-dev webpack-manifest-resource-plugin
```

## Usage


var ManifestPlugin = require('webpack-manifest-resource-plugin');

```js
module.exports = {
    // ...
    plugins: [
      new ManifestPlugin()
    ]
};
```

This will generate a manifest.json file in your root output directory with a mapping of all source file names to their corresponding output file, for example:

```json
{
  
 "mods/alpha.js": "mods/alpha.1234567890.js",
 "mods/alpha.css": "mods/alpha.435336266.css",
 "mods/omega.js": "mods/omega.0987654321.js",
 "mods/omega.css": "mods/omega.323299900.css",
 "vendor": "vendor.32465656.js"

  deps:{
    "mods/alpha.js":{
      js: ["vendor.32465656.js", "mods/alpha.1234567890.js"],
      css: ["mods/alpha.435336266.css"]
    },
    "mods/omega.js":{
      js: ["vendor.32465656.js", "mods/omega.0987654321.js"],
      css: ["mods/omega.323299900.css"]
    }
  }
}
```

## API

support [webpack-manifest-plugin](https://github.com/danethurber/webpack-manifest-plugin) all api, and add commonsChunk config:

### `options.commonsChunk`

Type: `Array`<br>
Default: `[]`


the `commonsChunk` is  `webpack.optimize.CommonsChunkPlugin` name config. 