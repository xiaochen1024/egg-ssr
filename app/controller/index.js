const { Controller } = require("egg");

class IndexController extends Controller {
  async render() {
    const { ctx } = this;
    await ctx.render("index.js");
  }
}

module.exports = IndexController;
