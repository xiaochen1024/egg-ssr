module.exports = (app) => {
  const { router, controller } = app;
  const { basename } = app.config.resourceURL;

  router.get(
    new RegExp(`${basename}\\/index(\\/.+)?`),
    controller.index.render,
  );
};
