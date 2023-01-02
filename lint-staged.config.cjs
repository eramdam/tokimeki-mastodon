module.exports = {
  "*": "prettier --ignore-unknown --write",
  "*.{ts,tsx}": ["eslint --fix"],
  "*.{js,mjs,cjs}": ["eslint --fix"],
};
