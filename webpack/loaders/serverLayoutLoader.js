module.exports = function serverLayoutLoader() {
  this.cacheable();
  return `
    import React, { Component } from 'react';
    import Layout from 'framework/layout/layout.jsx';
    import App from '${this.resourcePath.replace(/\\/g, '\\\\')}';
    export default class Page extends Component {
      render() {
        return (
          <Layout {...this.props}>
            <App {...this.props} />
          </Layout>
        );
      }
    }
  `;
};
