/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  // exclude: [

  // ],
  mount: {
    public: { url: "/", static: true },
    src: { url: "/dist" },
  },
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    "@snowpack/plugin-sass",
    // "@snowpack/plugin-webpack",
    "@snowpack/plugin-postcss",
    "./json-proxy-workaround.js",
    // https://github.com/snowpackjs/snowpack/issues/3109
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    bundle: true,
    minify: true,
    target: "es2017",
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    open: "none",
    port: 8081,
  },
  buildOptions: {
    /* ... */
  },
};
