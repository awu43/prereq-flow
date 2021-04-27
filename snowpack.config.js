const httpProxy = require("http-proxy");

const proxy = httpProxy.createServer({ target: "http://localhost:3000" });

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
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
    // {
    //   src: "/api/.*",
    //   dest: (req, res) => {
    //     req.url = req.url.replace(/^\/api/, "");
    //     proxy.web(req, res);
    //   }
    // }
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // bundle: true,
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
