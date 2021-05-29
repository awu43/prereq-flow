module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:jsx-a11y/recommended",
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
    "import",
    "jsx-a11y",
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    indent: ["error", 2, { SwitchCase: 1 }],
    quotes: ["error", "double"],
    "quote-props": ["error", "as-needed"],
    semi: ["error", "always"],
    "object-curly-spacing": ["error", "always"],
    "comma-dangle": ["error", "only-multiline"],
    "arrow-parens": ["error", "as-needed"],
    "no-param-reassign": ["error", { props: false }],
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    "no-unused-vars": ["error", {
      varsIgnorePattern: "^_",
      argsIgnorePattern: "^_",
    }],
    "prefer-const": ["error", { destructuring: "all" }],

    "react/jsx-boolean-value": ["error", "always"],
    "react/self-closing-comp": ["error", { component: true, html: false }],
  },
};
