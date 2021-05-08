// https://github.com/snowpackjs/snowpack/issues/3109#issuecomment-821514740
module.exports = function config() {
  return {
    name: "snowpack-config-resolveProxyImports-plugin",
    config(config) {
      setTimeout(() => {
        config.buildOptions.resolveProxyImports = true;
      });
    },
  };
};
