module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
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
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react"],
  rules: {
    "no-continue": 0,
    "no-else-return": 0,
    "no-param-reassign": [2, { props: false }],
    "no-plusplus": [2, { allowForLoopAfterthoughts: true }],
    "no-restricted-syntax": [
      2,
      "ForInStatement",
      "LabeledStatement",
      "WithStatement",
    ],
    "no-underscore-dangle": 0,

    "import/extensions": [
      2,
      "never",
      {
        json: "always",
        svg: "always",
      },
    ],
    "import/no-default-export": 2,
    "import/prefer-default-export": 0,
  },
  overrides: [
    {
      files: ["*.ts?(x)"],
      extends: ["plugin:@typescript-eslint/recommended"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      rules: {
        "no-empty-function": 0,
        "@typescript-eslint/no-empty-function": 0,
        "@typescript-eslint/no-inferrable-types": 0,
        "no-unused-vars": 0,
        "@typescript-eslint/no-unused-vars": [
          2,
          {
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
          },
        ],
      },
    },
    {
      files: ["*.tsx"],
      rules: {
        "import/no-default-export": 0,
        "import/prefer-default-export": 2,

        "react/jsx-boolean-value": [2, "always"],
        "react/jsx-filename-extension": [2, { extensions: [".tsx"] }],
        "react/jsx-no-bind": 0,
        "react/require-default-props": 0,
        "react/self-closing-comp": [2, { component: true, html: false }],

        "jsx-a11y/label-has-associated-control": [2, { assert: "either" }],
      },
    },
    {
      files: ["src/components/ContextMenu/*.tsx"],
      rules: {
        "react/destructuring-assignment": 0,
        "jsx-a11y/click-events-have-key-events": 0,
        "jsx-a11y/no-noninteractive-element-interactions": 0,
      },
    },
    {
      files: ["src/tests/*.test.js"],
      rules: {
        "no-unused-expressions": 0,
      },
    },
    {
      files: ["cypress/**/*.js"],
      plugins: ["cypress"],
      extends: ["plugin:cypress/recommended"],
    },
  ],
};
