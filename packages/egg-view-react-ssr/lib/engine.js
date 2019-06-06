const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Resource = require('server-side-render-resource');

const REACT_RESOURCE = Symbol('Application#resource');

class Engine {
  constructor(app) {
    this.app = app;
    this.config = app.config.reactssr;
  }

  get resource() {
    if (!this[REACT_RESOURCE]) {
      if (fs.existsSync(this.config.manifest)) {
        this[REACT_RESOURCE] = new Resource(this.app, this.config);
      }
    }
    return this[REACT_RESOURCE];
  }

  normalizeLocals(locals = {}) {
    [ 'ctx', 'request', 'helper' ].forEach(key => {
      Object.defineProperty(locals, key, { enumerable: false });
    });
    return locals;
  }

  normalizeModule(reactComponent) {
    return reactComponent && reactComponent.default ? reactComponent.default : reactComponent;
  }

  async render(name, locals, options) {
    // eslint-disable-next-line import/no-dynamic-require
    let reactComponent = this.normalizeModule(typeof name === 'string' ? require(name) : name);
    locals = this.normalizeLocals(locals);

    if (reactComponent.isWrapped) {
      locals.needFetch = false;
      reactComponent = await reactComponent(locals, options);
    }

    if (locals.needFetch === undefined) {
      locals.needFetch = true;
    }

    const html = this.renderToString(reactComponent, locals);
    return this.app.react.resource.inject(html, options.name, locals, options);
  }

  renderToString(reactComponent, locals) {
    const element = React.createElement(reactComponent, locals);
    return ReactDOMServer.renderToString(element);
  }
}

module.exports = Engine;
