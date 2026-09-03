import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
const allowedCss = "src/.vitepress/theme/tailwind.css";
const fontPackageCss = "packages/lxgw-wenkai-lite-webfont/index.css";
const ignoredDirectories = new Set(["dist", ".temp", "cache"]);
const failures = [];
const authoredSourceExtensions = new Set([".css", ".js", ".md", ".mjs", ".ts", ".vue"]);
const builtinPalette =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const colorUtility = "text|bg|border|ring|outline|fill|stroke|decoration|divide";
const builtinColorPattern = new RegExp(
  `\\b(?:${colorUtility})-(?:(?:${builtinPalette})-(?:50|100|200|300|400|500|600|700|800|900|950)|black|white)(?:/\\d+)?\\b`,
  "g",
);
const builtinProsePattern = new RegExp(`\\b(?:prose-(?:${builtinPalette})|prose-invert)\\b`, "g");
const arbitraryColorPattern = new RegExp(
  `\\b(?:${colorUtility})-\\[(?:#|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\\()`,
  "gi",
);
const legacyColorName =
  "canvas|surface(?:-subtle)?|ink(?:-muted|-subtle)?|line(?:-strong)?|accent-(?:strong|soft)|notice-[\\w-]+|draft-[\\w-]+|scrim(?:-soft)?|preview-[\\w-]+|photo-[\\w-]+|live-(?:surface|ink)|code-(?:surface(?:-raised)?|line|muted|subtle|ink|control-(?:surface|line|ink)|accent-focus|add(?:-ink)?|remove(?:-ink)?)";
const legacyTokenPattern = new RegExp(
  `--color-(?:${legacyColorName})(?![\\w-])|\\b(?:bg|text|border|ring|outline|fill|stroke|decoration|divide)-(?:${legacyColorName})(?![\\w-])`,
  "g",
);
const replaceableArbitraryPattern =
  /\b(?:text|tracking|backdrop-blur|aspect)-\[[^\]\r\n]+\]|\banimate-\[spin[^\]\r\n]*\]/g;

const requiredThemeTokens = [
  "--spacing",
  "--spacing-page-gutter",
  "--spacing-header",
  "--spacing-control",
  "--spacing-side-rail-top",
  "--breakpoint-sm",
  "--breakpoint-xl",
  "--font-sans",
  "--font-mono",
  "--font-weight-normal",
  "--font-weight-medium",
  "--text-sm",
  "--text-label",
  "--text-article-body",
  "--leading-copy",
  "--leading-code",
  "--tracking-normal",
  "--tracking-live",
  "--radius",
  "--radius-sm",
  "--radius-xl",
  "--container-content",
  "--container-article",
  "--container-layout",
  "--z-index-content",
  "--z-index-control",
  "--z-index-player",
  "--z-index-navigation",
  "--shadow-sm",
  "--shadow-lg",
  "--blur-code",
  "--blur-xl",
  "--aspect-landscape",
  "--aspect-cover",
  "--duration-instant",
  "--duration-slow",
  "--ease-standard",
  "--ease-out",
  "--animate-spinner",
  "--animate-live-photo",
  "--animate-music-record",
];
const pairedColors = [
  ["--color-background", "--color-foreground"],
  ["--color-overlay", "--color-overlay-foreground"],
  ...[
    "card",
    "popover",
    "primary",
    "secondary",
    "muted",
    "accent",
    "info",
    "success",
    "important",
    "warning",
    "destructive",
    "caution",
  ].map((name) => [`--color-${name}`, `--color-${name}-foreground`]),
  ...["background", "card", "inserted", "deleted"].map((name) => [
    `--color-code-${name}`,
    `--color-code-${name === "background" ? "foreground" : `${name}-foreground`}`,
  ]),
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

for (const file of await walk(sourceRoot)) {
  const name = relative(root, file).replace(/\\/g, "/");
  const extension = extname(file);
  const content = await readFile(file, "utf8");
  if (authoredSourceExtensions.has(extension)) {
    const builtinColor = content.match(builtinColorPattern)?.[0] ?? content.match(builtinProsePattern)?.[0];
    if (builtinColor) failures.push(`${name}: 不允许 Tailwind 内置颜色 ${builtinColor}`);
    const arbitraryColor = content.match(arbitraryColorPattern)?.[0];
    if (arbitraryColor) failures.push(`${name}: 不允许任意硬编码颜色 ${arbitraryColor}`);
    const legacyToken = content.match(legacyTokenPattern)?.[0];
    if (legacyToken) failures.push(`${name}: 不允许旧设计令牌 ${legacyToken}`);
    const replaceableArbitrary = content.match(replaceableArbitraryPattern)?.[0];
    if (replaceableArbitrary) failures.push(`${name}: ${replaceableArbitrary} 必须改用现有命名令牌`);
  }
  if (extension === ".css" && name !== allowedCss) {
    failures.push(`${name}: 不允许额外 CSS 文件`);
  }
  if (extension === ".vue") {
    const hasStyleTag = /<style(?:\s|>)/i.test(content);
    const styleBlocks = [...content.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/gi)];
    if (hasStyleTag) {
      const styleAttributes = styleBlocks[0]?.[1] ?? "";
      if (styleBlocks.length !== 1 || !/\bscoped\b/i.test(styleAttributes))
        failures.push(`${name}: Vue 组件最多只能包含一个 <style scoped>`);
      if (/\bmodule\b/i.test(styleAttributes)) failures.push(`${name}: 不允许 CSS Modules`);
      const scopedCss = styleBlocks[0]?.[2] ?? "";
      if (/\b(?:@apply|@import|@reference|@tailwind)\b/i.test(scopedCss))
        failures.push(`${name}: scoped CSS 不得隐藏 Tailwind 指令或 utility`);
      if (/#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\s*\(/i.test(scopedCss))
        failures.push(`${name}: scoped CSS 必须读取语义颜色令牌，不得硬编码颜色`);
      if (/:global\s*\(/i.test(scopedCss)) failures.push(`${name}: scoped CSS 不得通过 :global() 修改全局样式`);
    }
    if (/\sstyle\s*=/.test(content)) failures.push(`${name}: 不允许内联 style 属性`);
    if (/styled\.|css`|useCssModule/.test(content)) failures.push(`${name}: 不允许 CSS-in-JS 或 CSS Modules`);
    for (const match of content.matchAll(/:class\s*=\s*"([^"\n]*)"/g)) {
      if (match[1].includes("`") || match[1].includes("+")) {
        failures.push(`${name}: 不允许动态拼接 class name`);
        break;
      }
    }
  }
}

const fontCss = await readFile(join(root, fontPackageCss), "utf8");
const fontRules = fontCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/@font-face\s*\{[^}]*\}/g, "")
  .trim();
if (fontRules || !fontCss.includes("@font-face")) failures.push(`${fontPackageCss}: 字体包入口只允许 @font-face`);
const fontWeights = new Set([...fontCss.matchAll(/font-weight:\s*(\d+)/g)].map((match) => match[1]));
if ([...fontWeights].sort().join(",") !== "400,500")
  failures.push(`${fontPackageCss}: 字体包只允许 Regular 400 与 Medium 500`);
for (const match of fontCss.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
  if (!/^\.\/files\/[a-z0-9-]+\.woff2$/i.test(match[2])) {
    failures.push(`${fontPackageCss}: 字体地址必须指向包内 WOFF2`);
    break;
  }
}

const tailwindFile = new URL(`../${allowedCss}`, import.meta.url);
const tailwind = (await readFile(tailwindFile, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
const themeColors = new Set();
const darkThemeColors = new Set();
const themeTokens = new Set();
let inDarkThemeUtility = false;
let inNamedUtility = false;
for (const [index, rawLine] of tailwind.split(/\r?\n/).entries()) {
  const line = rawLine.trim();
  if (line.startsWith("@utility ") && line.endsWith("{")) {
    inNamedUtility = true;
    inDarkThemeUtility = line === "@utility theme-dark {";
    continue;
  }
  if (inNamedUtility && line === "}") {
    inNamedUtility = false;
    inDarkThemeUtility = false;
    continue;
  }
  if (line.startsWith("--color-") && line.endsWith(";")) {
    const separator = line.indexOf(":");
    const property = line.slice(0, separator);
    const value = line.slice(separator + 1, -1).trim();
    if (property !== "--color-*") {
      if (!/^oklab\([^;]+\)$/.test(value)) failures.push(`${allowedCss}:${index + 1}: ${property} 必须使用 oklab()`);
      if (/^--color-(?:light|night)-/.test(property))
        failures.push(`${allowedCss}:${index + 1}: 明暗主题必须覆盖同名语义颜色，不能定义 ${property}`);
      (inDarkThemeUtility ? darkThemeColors : themeColors).add(property);
    }
  }
  if (!inDarkThemeUtility && line.startsWith("--") && line.endsWith(";"))
    themeTokens.add(line.slice(0, line.indexOf(":")));
  if (line.startsWith("--shadow-") && line !== "--shadow-*: initial;" && line.endsWith(";")) {
    const separator = line.indexOf(":");
    const property = line.slice(0, separator);
    const value = line.slice(separator + 1, -1).trim();
    if (!value.includes("oklab(") || /#|\brgba?\(|\bhsla?\(|\boklch\(|\blab\(|\blch\(/i.test(value))
      failures.push(`${allowedCss}:${index + 1}: ${property} 中的颜色必须使用 oklab()`);
  }
  if (!line || line === "}" || line.startsWith("@") || line.startsWith("--") || inNamedUtility) continue;
  failures.push(`${allowedCss}:${index + 1}: Tailwind 入口只允许指令和主题令牌`);
}

if (!tailwind.includes("--color-*: initial;")) failures.push(`${allowedCss}: 必须关闭 Tailwind 默认颜色命名空间`);
if (!tailwind.includes("@utility theme-dark {"))
  failures.push(`${allowedCss}: 必须使用 theme-dark utility 集中覆盖暗色主题`);
for (const property of darkThemeColors) {
  if (!themeColors.has(property)) failures.push(`${allowedCss}: theme-dark 只能覆盖已定义的同名语义颜色 ${property}`);
}
for (const property of requiredThemeTokens) {
  if (!themeTokens.has(property)) failures.push(`${allowedCss}: 缺少设计系统令牌 ${property}`);
}
for (const [surface, foreground] of pairedColors) {
  if (themeColors.has(surface) !== themeColors.has(foreground))
    failures.push(`${allowedCss}: ${surface} 与 ${foreground} 必须成对定义`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Authored styles audit passed");
