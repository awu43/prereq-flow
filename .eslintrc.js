module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "airbnb",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: [
    "react",
    "react-hooks",
    "@typescript-eslint",
  ],
  rules: {
    quotes: ["error", "double"],
    "no-restricted-syntax": [
      "error", "ForInStatement", "LabeledStatement", "WithStatement"
    ],
    "comma-dangle": ["error", "only-multiline"],
    "arrow-parens": ["error", "as-needed"],
    "no-param-reassign": ["error", { props: false }],
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    // "no-unused-vars": ["error", {
    //   varsIgnorePattern: "^_",
    //   argsIgnorePattern: "^_",
    // }],
    "prefer-const": ["error", { destructuring: "all" }],
    "no-underscore-dangle": "off",
    "no-else-return": "off",
    "object-curly-newline": "off",
    "no-continue": "off",

    "import/extensions": "off",
    "react/jsx-filename-extension": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/destructuring-assignment": "off",
    "react/jsx-boolean-value": ["error", "always"],
    "react/no-unescaped-entities": ["error", { forbid: [">"] }],
    "react/self-closing-comp": ["error", { component: true, html: false }],
    "jsx-a11y/label-has-associated-control": ["error", { assert: "either" }],
    "max-len": "off",

    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      varsIgnorePattern: "^_",
      argsIgnorePattern: "^_",
    }],
  },
};
