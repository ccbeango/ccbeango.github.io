import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const editorConfigFile = new URL("../../.editorconfig", import.meta.url);
const eslintConfigFile = new URL("../../eslint.config.mjs", import.meta.url);
const gitAttributesFile = new URL("../../.gitattributes", import.meta.url);
const deployWorkflowFile = new URL("../../.github/workflows/deploy.yml", import.meta.url);
const lintStagedConfigFile = new URL("../../lint-staged.config.mjs", import.meta.url);
const packageFile = new URL("../../package.json", import.meta.url);
const prettierConfigFile = new URL("../../prettier.config.mjs", import.meta.url);
const vscodeSettingsFile = new URL("../../.vscode/settings.json", import.meta.url);

describe("代码格式化配置", () => {
  it("统一使用 LF 和文件末尾换行", async () => {
    const [editorConfig, gitAttributes] = await Promise.all([
      readFile(editorConfigFile, "utf8"),
      readFile(gitAttributesFile, "utf8"),
    ]);

    expect(editorConfig).toContain("end_of_line = lf");
    expect(editorConfig).toContain("insert_final_newline = true");
    expect(gitAttributes).toContain("* text=auto eol=lf");
  });

  it("使用各生态官方 ESLint Flat Config 检查代码质量", async () => {
    const [eslintConfig, packageSource] = await Promise.all([
      readFile(eslintConfigFile, "utf8"),
      readFile(packageFile, "utf8"),
    ]);
    const packageJson = JSON.parse(packageSource);

    expect(packageJson.devDependencies).toMatchObject({
      "@eslint/js": expect.any(String),
      "@eslint/markdown": expect.any(String),
      "eslint-plugin-vue": expect.any(String),
      "typescript-eslint": expect.any(String),
    });
    expect(packageJson.devDependencies).not.toHaveProperty("@antfu/eslint-config");
    expect(eslintConfig).toContain("js.configs.recommended");
    expect(eslintConfig).toContain("tseslint.configs.recommended");
    expect(eslintConfig).toContain('vue.configs["flat/recommended"]');
    expect(eslintConfig).toContain("markdown.configs.recommended");
    expect(eslintConfig).toContain('"better-tailwindcss/enforce-canonical-classes"');
  });

  it("统一由 Prettier 格式化并排序 Tailwind class", async () => {
    const [packageSource, prettierConfig, vscodeSource] = await Promise.all([
      readFile(packageFile, "utf8"),
      readFile(prettierConfigFile, "utf8"),
      readFile(vscodeSettingsFile, "utf8"),
    ]);
    const packageJson = JSON.parse(packageSource);
    const vscodeSettings = JSON.parse(vscodeSource);

    expect(packageJson.scripts.format).toBe("prettier . --write");
    expect(packageJson.scripts["format:check"]).toBe("prettier . --check");
    expect(prettierConfig).toContain('plugins: ["prettier-plugin-tailwindcss"]');
    expect(prettierConfig).toContain('htmlWhitespaceSensitivity: "ignore"');
    expect(prettierConfig).toContain("printWidth: 120");
    expect(prettierConfig).toContain("singleAttributePerLine: true");
    expect(vscodeSettings["editor.defaultFormatter"]).toBe("esbenp.prettier-vscode");
    expect(vscodeSettings["editor.formatOnSave"]).toBe(true);
    expect(vscodeSettings["eslint.format.enable"]).toBe(false);
  });
});

describe("发布检查配置", () => {
  it("不安装浏览器的生产检查通过后才上传 GitHub Pages artifact", async () => {
    const [workflow, packageSource] = await Promise.all([
      readFile(deployWorkflowFile, "utf8"),
      readFile(packageFile, "utf8"),
    ]);
    const packageJson = JSON.parse(packageSource);
    const checkIndex = workflow.indexOf("pnpm check:build");
    const uploadIndex = workflow.indexOf("actions/upload-pages-artifact@v3");

    expect(checkIndex).toBeGreaterThan(-1);
    expect(uploadIndex).toBeGreaterThan(checkIndex);
    expect(workflow).not.toContain("playwright install");
    for (const command of [
      "font:check",
      "format:check",
      "audit:styles",
      "lint",
      "typecheck",
      "test",
      "build",
      "verify:build",
    ]) {
      expect(packageJson.scripts["check:build"]).toContain(`pnpm ${command}`);
    }
    expect(packageJson.scripts["check:build"]).not.toContain("test:e2e");
    expect(packageJson.scripts.check).toBe("pnpm check:build && pnpm test:e2e");
  });

  it("提交前只校验暂存文件的格式、质量和相关样式", async () => {
    const [packageSource, lintStagedConfig] = await Promise.all([
      readFile(packageFile, "utf8"),
      readFile(lintStagedConfigFile, "utf8"),
    ]);
    const packageJson = JSON.parse(packageSource);

    expect(packageJson.devDependencies).toMatchObject({
      "lint-staged": expect.any(String),
      "simple-git-hooks": expect.any(String),
    });
    expect(packageJson.scripts.prepare).toBe("simple-git-hooks");
    expect(packageJson.scripts["check:staged"]).toBe("lint-staged");
    expect(packageJson["simple-git-hooks"]).toEqual({ "pre-commit": "pnpm check:staged" });
    expect(lintStagedConfig).toContain('"prettier --check"');
    expect(lintStagedConfig).toContain('"eslint"');
    expect(lintStagedConfig).toContain('() => "pnpm audit:styles"');
    expect(lintStagedConfig).not.toContain("--write");
    expect(lintStagedConfig).not.toContain("--fix");
  });
});
