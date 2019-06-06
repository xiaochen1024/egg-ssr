const BaseIndexAPI = require("./base_index_api");

class IndexAPI extends BaseIndexAPI {
  index(params) {
    return this.post("/api/", params);
  }
}

module.exports = IndexAPI;
