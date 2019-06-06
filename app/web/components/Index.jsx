import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject(stores => ({
  indexStore: stores.indexStore
}))
@observer
class Index extends Component {
  render() {
    return (
      <div>
        <button onClick={this.props.indexStore.add}>{this.props.indexStore.count}</button>
      </div>
    );
  }
}

export default Index;
