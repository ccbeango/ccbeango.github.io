import js from "@eslint/js";
import markdown from "@eslint/markdown";
import prettier from "eslint-config-prettier/flat";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import vue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";
import { defineConfig } from "eslint/config";

const javascriptFiles = ["**/*.{cjs,js,mjs}"];
const typescriptFiles = ["**/*.{cts,mts,ts,tsx}"];
const vueFiles = ["**/*.vue"];

export default defineConfig([
  {
    name: "bean-blog/ignores",
    ignores: [
      ".codex/**",
      "coverage/**",
      "node_modules/**",
      "playwright-report/**",
      "pnpm-lock.yaml",
      "src/.vitepress/.temp/**",
      "src/.vitepress/cache/**",
      "src/.vitepress/dist/**",
      "test-results/**",
    ],
  },
  {
    ...js.configs.recommended,
    name: "bean-blog/javascript",
    files: javascriptFiles,
    languageOptions: {
      globals: globals.node,
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    name: `bean-blog/typescript/${config.name ?? "recommended"}`,
    files: typescriptFiles,
  })),
  {
    name: "bean-blog/typescript-project-conventions",
    files: typescriptFiles,
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
    },
  },
  ...vue.configs["flat/recommended"].map((config) => ({
    ...config,
    name: `bean-blog/vue/${config.name ?? "recommended"}`,
    files: vueFiles,
  })),
  {
    name: "bean-blog/vue-typescript",
    files: vueFiles,
    languageOptions: {
      globals: globals.browser,
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        extraFileExtensions: [".vue"],
        parser: tseslint.parser,
        sourceType: "module",
      },
    },
  },
  {
    name: "bean-blog/markdown",
    files: ["**/*.md"],
    language: "markdown/gfm",
    plugins: {
      markdown,
    },
    rules: {
      ...markdown.configs.recommended[0].rules,
      // VitePress [[toc]] and GitHub Alerts are parsed as references by generic GFM linting.
      "markdown/no-missing-label-refs": "off",
    },
  },
  {
    name: "bean-blog/vitepress-layout-name",
    files: ["src/.vitepress/theme/Layout.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  {
    name: "bean-blog/tailwindcss",
    files: ["src/.vitepress/theme/**/*.vue"],
    plugins: {
      "better-tailwindcss": betterTailwindcss,
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/.vitepress/theme/tailwind.css",
        rootFontSize: 16,
      },
    },
    rules: {
      "better-tailwindcss/enforce-canonical-classes": [
        "error",
        {
          collapse: false,
          logical: false,
        },
      ],
    },
  },
  prettier,
]);
