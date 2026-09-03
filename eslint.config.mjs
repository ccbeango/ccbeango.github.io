import antfu from "@antfu/eslint-config";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

export default antfu({
  formatters: false,
  markdown: true,
  typescript: true,
  vue: true,
  stylistic: {
    indent: 2,
    quotes: "double",
    semi: true,
  },
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
}, {
  name: "bean-blog/line-wrapping",
  files: ["**/*.{cjs,js,mjs,ts,tsx,vue}"],
  rules: {
    "style/max-len": ["error", {
      code: 120,
      comments: 120,
      ignorePattern: "^\\s*(?:class|:class)=",
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreUrls: true,
      tabWidth: 2,
    }],
    "vue/max-attributes-per-line": ["error", {
      multiline: { max: 1 },
      singleline: { max: 1 },
    }],
  },
}, {
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
    "better-tailwindcss/enforce-canonical-classes": ["error", {
      collapse: false,
      logical: false,
    }],
    "better-tailwindcss/enforce-consistent-class-order": ["error", {
      order: "official",
    }],
  },
}, {
  name: "bean-blog/node-globals",
  rules: {
    "node/prefer-global/buffer": "off",
    "node/prefer-global/process": "off",
  },
}, {
  name: "bean-blog/pnpm-workspace",
  files: ["pnpm-workspace.yaml"],
  rules: {
    "pnpm/yaml-enforce-settings": "off",
    "markdown/require-alt-text": "off",
  },
});
