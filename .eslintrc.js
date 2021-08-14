module.exports = {
  env: {
    browser: true,
    es2021: true,
    mocha: true,
  },
  extends: [
    "plugin:react/recommended",
    "airbnb",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react"],
  rules: {
    "no-restricted-syntax": [
      2,
      "ForInStatement",
      "LabeledStatement",
      "WithStatement",
    ],
    "import/extensions": [
      2,
      "never",
      {
        json: "always",
        svg: "always",
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
      ],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      rules: {
        "import/no-unresolved": 0,
        "react/jsx-filename-extension": [2, { extensions: [".tsx"] }],

        "no-use-before-define": 0,
        "@typescript-eslint/no-use-before-define": 2,
        "import/no-duplicates": 0,
        "@typescript-eslint/no-duplicate-imports": 2,
      },
    },
    {
      files: ["**/*.spec.js"],
      plugins: ["cypress"],
      extends: ["plugin:cypress/recommended"],
    },
  ],
};
