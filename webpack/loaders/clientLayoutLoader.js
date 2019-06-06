module.exports = function clientLayoutLoader() {
  const importPath = this.resourcePath.replace(/\\/g, '\\\\');

  this.cacheable();
  return `
    import React from 'react';
    import ReactDom from 'react-dom';
    import { AppContainer } from 'react-hot-loader';
    import Entry from '${importPath}';
    const state = window.__INITIAL_STATE__;
    const render = (App)=>{
      ReactDom.hydrate(
        <App {...state} />,
        document.getElementById('app')
      );
    };
    render(Entry);
  `;
};
