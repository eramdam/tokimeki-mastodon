module.exports = {
  "*.{json,html,svg}": "prettier --write",
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,mjs,cjs}": ["eslint --fix", "prettier --write"],
};
