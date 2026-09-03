import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const editorConfigFile = new URL("../../.editorconfig", import.meta.url);
const eslintConfigFile = new URL("../../eslint.config.mjs", import.meta.url);
const gitAttributesFile = new URL("../../.gitattributes", import.meta.url);

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

  it("由 ESLint 约束代码长度和 Vue 属性换行", async () => {
    const eslintConfig = await readFile(eslintConfigFile, "utf8");

    expect(eslintConfig).toContain("formatters: false");
    expect(eslintConfig).toContain("\"style/max-len\": [\"error\"");
    expect(eslintConfig).toContain("code: 120");
    expect(eslintConfig).toContain("\"vue/max-attributes-per-line\": [\"error\"");
  });
});
