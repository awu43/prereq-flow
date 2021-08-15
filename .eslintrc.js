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
    "no-param-reassign": [2, { props: false }],
    "no-plusplus": [2, { allowForLoopAfterthoughts: true }],
    "react/jsx-boolean-value": [2, "always"],
    "jsx-a11y/label-has-associated-control": [2, { assert: "either" }],
    "react/self-closing-comp": [2, { component: true, html: false }],

    "import/no-named-default": 0,
    "no-continue": 0,
    "no-underscore-dangle": 0,
    "no-else-return": 0,
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
        "react/jsx-filename-extension": [2, { extensions: [".tsx"] }],
        "import/no-unresolved": 0,
        "react/require-default-props": 0,
        "@typescript-eslint/no-inferrable-types": 0,

        "no-use-before-define": 0,
        "@typescript-eslint/no-use-before-define": 2,
        "import/no-duplicates": 0,
        "@typescript-eslint/no-duplicate-imports": 2,
        "no-unused-vars": 0,
        "@typescript-eslint/no-unused-vars": [
          2,
          {
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
          },
        ],
        "no-empty-function": 0,
        "@typescript-eslint/no-empty-function": 0,
      },
    },
    {
      files: ["src/components/ContextMenu/*.tsx"],
      rules: {
        "react/destructuring-assignment": 0,
        "jsx-a11y/no-noninteractive-element-interactions": 0,
        "jsx-a11y/click-events-have-key-events": 0,
      },
    },
    {
      files: ["**/*.test.{jsx,js}"],
      rules: {
        "import/no-unresolved": 0,
        "no-unused-expressions": 0,
      },
    },
    {
      files: ["**/*.spec.js"],
      plugins: ["cypress"],
      extends: ["plugin:cypress/recommended"],
    },
  ],
};
