import React from "react";

const globalStyles = `
  .loader-container {
    position: fixed;
    left: 0;
    top: 40%;
    width: 100%;
    height: 52px;
    margin-top: -26px;
  }

  .loader,
  .loader:after {
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }
  .loader {
    margin: 0 auto;
    font-size: 10px;
    position: relative;
    text-indent: -9999em;
    border-top: 5px solid rgba(93,139,255, 0.3);
    border-right: 5px solid rgba(93,139,255, 0.3);
    border-bottom: 5px solid rgba(93,139,255, 0.3);
    border-left: 5px solid #068BFE;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation: load8 1.1s infinite linear;
    animation: load8 1.1s infinite linear;
  }
  @-webkit-keyframes load8 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes load8 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`;

export default ({ title, keywords, description, apiConfig, resourceURL, children, globalInfo }) => {
  const {} = globalInfo;

  const globals = `
    window.__GLOBAL_INFO__  = ${JSON.stringify(globalInfo)};
    window.__H5_URL__ = ${JSON.stringify(resourceURL)};
    window.__API_CONFIG__ = ${JSON.stringify(apiConfig)};
    Object.freeze(window.__API_CONFIG__);
  `;

  // const initialScript = `
  //   if ('addEventListener' in document) {
  //     FastClick.prototype.focus = function(targetElement) {
  //       targetElement.focus();
  //     };
  //     document.addEventListener('DOMContentLoaded', function() {
  //       FastClick.attach(document.body);
  //     }, false);
  //   }
  // `;

  return (
    <html lang="zh">
      <head>
        <title>{title || ""}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui" />
        <meta name="keywords" content={keywords} />
        <meta name="description" content={description} />
        {/* <script type="text/javascript" dangerouslySetInnerHTML={{ __html: initialScript }} /> */}

        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        <script type="text/javascript" charSet="utf-8" dangerouslySetInnerHTML={{ __html: globals }} />
      </head>
      <body>
        <div id="app">
          {/* <div className="loader-container">
            <div className="loader">加载中...</div>
          </div> */}
          {children}
        </div>
      </body>
    </html>
  );
};
