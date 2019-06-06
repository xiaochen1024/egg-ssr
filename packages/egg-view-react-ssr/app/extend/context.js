
module.exports = {
  renderClient(name, locals, options) {
    return this.renderReactClient(name, locals, options);
  },

  async renderReactClient(name, locals, options = {}) {
    const config = this.app.config.reactssr;
    const layout = options.layout || config.layout;
    locals = Object.assign({}, { csrf: this.csrf }, this.locals, locals);
    options = Object.assign({}, options, { name, markup: true });
    const html = await this.app.react.render(layout, locals, options);
    this.body = html;
  },
};
