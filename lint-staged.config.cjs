module.exports = {
  "*": "prettier --ignore-unknown --write",
  "*.{ts,tsx,mjs}": ["organize-imports-cli", "eslint --fix"],
};
