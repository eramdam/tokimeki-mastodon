module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "simple-import-sort", "unused-imports"],
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/consistent-type-imports": "warn",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": process.env.VSCODE_PID
      ? "off"
      : "error",
  },
};
