import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(await readFile(join(packageDirectory, "package.json"), "utf8"));
const source = JSON.parse(await readFile(join(packageDirectory, "source.json"), "utf8"));
const unicodeRanges = JSON.parse(await readFile(join(packageDirectory, "unicode.json"), "utf8"));
const version = (await readFile(join(packageDirectory, "VERSION"), "utf8")).trim();
const css = await readFile(join(packageDirectory, "index.css"), "utf8");
const fontFiles = (await readdir(join(packageDirectory, "files"))).sort();
const failures = [];

const expectedPackageVersion = [...source.tag.replace(/^v/, "").split("."), "0", "0"].slice(0, 3).join(".");
if (version !== source.tag) failures.push(`VERSION ${version} does not match source tag ${source.tag}`);
if (packageJson.version !== expectedPackageVersion)
  failures.push(`Package version ${packageJson.version} does not match ${expectedPackageVersion}`);
if (packageJson.types !== "./index.d.ts") failures.push("Package types must point to ./index.d.ts");
if (packageJson.exports?.["."]?.types !== "./index.d.ts") failures.push("Package root types must export ./index.d.ts");
if (packageJson.exports?.["."]?.default !== "./index.css")
  failures.push("Package root default must export ./index.css");

const rules = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
const remainder = css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/@font-face\s*\{[^}]*\}/g, "")
  .trim();
if (remainder) failures.push("index.css may only contain @font-face rules");
if (rules.length !== source.assets.length * Object.keys(unicodeRanges).length)
  failures.push(
    `Expected ${source.assets.length * Object.keys(unicodeRanges).length} font-face rules, found ${rules.length}`,
  );

const expectedWeights = new Set(source.assets.map((asset) => String(asset.weight)));
const actualWeights = new Set([...css.matchAll(/font-weight:\s*(\d+)/g)].map((match) => match[1]));
if ([...actualWeights].sort().join(",") !== [...expectedWeights].sort().join(","))
  failures.push(`Unexpected font weights: ${[...actualWeights].join(", ")}`);

const referencedFiles = [...css.matchAll(/url\('\.\/files\/([a-z0-9-]+\.woff2)'\)/g)].map((match) => match[1]).sort();
if (referencedFiles.length !== rules.length) failures.push("Every font-face rule must reference one local WOFF2 file");
if (JSON.stringify(referencedFiles) !== JSON.stringify(fontFiles))
  failures.push("CSS references and generated WOFF2 files do not match");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`LXGW WenKai Lite ${source.tag}: ${rules.length} local WOFF2 subsets verified`);
