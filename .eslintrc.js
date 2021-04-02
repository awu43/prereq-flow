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
    "no-unused-vars": ["error", {
      varsIgnorePattern: "^_",
      argsIgnorePattern: "^_",
    }],
    "prefer-const": ["error", { destructuring: "all" }],

    "no-underscore-dangle": [0],
    "no-else-return": [0],
    "object-curly-newline": [0],
    "no-continue": [0],

    "import/extensions": [0],
    "react/jsx-one-expression-per-line": [0],
    "react/destructuring-assignment": [0],
    "react/jsx-boolean-value": [2, "always"],
    "react/no-unescaped-entities": [2, { forbid: [">"] }],
    "react/self-closing-comp": ["error", { component: true, html: false }],
    "jsx-a11y/label-has-associated-control": [2, { assert: "either" }],
    "max-len": [0],

    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
  },
};
