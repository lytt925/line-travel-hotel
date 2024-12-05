const teardown = async () => {
  await global.mysql.stop();
  await global.datasource.destroy();
};

export default teardown;
