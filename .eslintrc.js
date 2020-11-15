module.exports = {
  extends: ["prettier"],
  env: {
    browser: true,
    es6: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    jsx: true,
    sourceType: "module",
  },
  plugins: ["react", "react-hooks"],
  rules: {
    /* Error */
    "react-hooks/exhaustive-deps": "error",
    "react-hooks/rules-of-hooks": "error",
    "react/jsx-curly-brace-presence": ["error", { props: "never" }],
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-target-blank": "error",
    "react/no-danger-with-children": "error",
    "react/no-deprecated": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-typos": "error",
  },
};
