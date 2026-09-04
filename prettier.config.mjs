/** @type {import("prettier").Config} */
export default {
  embeddedLanguageFormatting: "off",
  endOfLine: "lf",
  htmlWhitespaceSensitivity: "ignore",
  plugins: ["prettier-plugin-tailwindcss"],
  printWidth: 120,
  proseWrap: "preserve",
  semi: true,
  singleAttributePerLine: true,
  singleQuote: false,
  tabWidth: 2,
  tailwindStylesheet: "./src/.vitepress/theme/tailwind.css",
  trailingComma: "all",
  useTabs: false,
};
