import React from "react";
import ReactDOM from "react-dom";
import { URL } from "url";
import { BrowserRouter, StaticRouter } from "react-router-dom";
import { renderRoutes, matchRoutes } from "react-router-config";
import { Provider, useStaticRendering } from "mobx-react";
import { AppContainer } from "react-hot-loader";

import { createStores, persistStores, hydrateStores } from "utils/store";
import Layout from "framework/layout/layout";
import configuration from "utils/globalConfiguration";

export default function wrapEntry(routes = [], storesClass = {}) {
  function clientRender() {
    const stores = createStores(storesClass, null);
    hydrateStores(stores, window.__INITIAL_STATE__);
    const globalInfo = window.__GLOBAL_INFO__;
    configuration.set(globalInfo);

    const Entry = () => (
      <Provider {...stores}>
        <BrowserRouter basename={globalInfo.resourceURL.basename}>
          {renderRoutes(routes, { globalInfo })}
        </BrowserRouter>
      </Provider>
    );

    const render = App => {
      const RootComponent = ENV_IS_DEV ? (
        <AppContainer>
          <App />
        </AppContainer>
      ) : (
        <App />
      );
      ReactDOM.hydrate(RootComponent, document.getElementById("app"));
    };

    if (ENV_IS_DEV && module.hot) {
      module.hot.accept();
    }

    render(Entry);
  }

  async function serverRender(locals) {
    useStaticRendering(true);

    const { ctx, apiConfig, resourceURL, globalInfo } = locals;
    configuration.set(globalInfo);

    const routerContext = {};
    const basename = new URL(resourceURL.h5root).pathname;
    const pathname = ctx.path.replace(basename, "") || "/";
    const stores = createStores(storesClass, ctx);
    const branch = matchRoutes(routes, pathname);
    const promises = branch.map(({ route }) => {
      const { fetch } = route.component;
      return fetch instanceof Function ? fetch(stores) : Promise.resolve(null);
    });

    try {
      await Promise.all(promises);
      locals.state = persistStores(stores);
      Object.assign(globalInfo, { statePreloaded: true });
    } catch (err) {
      ctx.logger.error(err);
      locals.state = {};
      Object.assign(globalInfo, { statePreloaded: false });
    }

    return () => (
      <Layout {...{ apiConfig, resourceURL, globalInfo }}>
        <Provider {...stores}>
          <StaticRouter location={ctx.originalUrl} context={routerContext} basename={basename}>
            {renderRoutes(routes, { globalInfo })}
          </StaticRouter>
        </Provider>
      </Layout>
    );
  }

  serverRender.isWrapped = true; // 服务端渲染时，用于准确区分是否为React Component

  return ENV_IS_NODE ? serverRender : clientRender();
}
