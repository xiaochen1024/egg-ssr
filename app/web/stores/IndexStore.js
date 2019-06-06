import { observable, action, computed, runInAction } from "mobx";
import IndexAPI from "api/index";

import BaseStore from "stores/BaseStore";

const { assign } = Object;
const apisClass = {
  index: IndexAPI
};

export default class IndexStore extends BaseStore {
  constructor(ctx) {
    super();
    this.registerAPI(apisClass, ctx);
  }

  @observable count = 0;

  @action
  add = async () => {
    this.count += 1;
  };
}
