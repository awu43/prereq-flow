/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  exclude: [
    "**/src/tests/*",
  ],
  mount: {
    public: { url: "/", static: true },
    src: { url: "/dist" },
  },
  alias: {
    "@utils": "./src/utils.ts",
    "@usePrefersReducedMotion": "./src/usePrefersReducedMotion.tsx",
    "@useDialogStatus": "./src/useDialogStatus",
  },
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    ["@snowpack/plugin-typescript", {
      // Yarn PnP workaround
      // https://www.npmjs.com/package/@snowpack/plugin-typescript
      ...(process.versions.pnp ? { tsc: "yarn pnpify tsc" } : {}),
    }],
    "@snowpack/plugin-sass",
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
    knownEntrypoints: [
      "@testing-library/react",
      "@testing-library/user-event",
      "chai",
    ],
  },
  devOptions: {
    open: "none",
    port: 8081,
  },
  buildOptions: {
    /* ... */
  },
};
