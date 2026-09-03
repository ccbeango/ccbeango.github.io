export default {
  "*.{cjs,js,md,mjs,ts,tsx,vue}": ["prettier --check", "eslint"],
  "*.{css,html,json,jsonc,yaml,yml}": "prettier --check",
  "{scripts/audit-styles.mjs,src/.vitepress/theme/**/*.{css,vue}}": () => "pnpm audit:styles",
};
