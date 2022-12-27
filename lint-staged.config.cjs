module.exports = {
  "*": "prettier --ignore-unknown --write",
  "*.{ts,tsx}": ["organize-imports-cli", "eslint --fix"],
  "*.{js,mjs,cjs}": ["eslint --fix"],
};
