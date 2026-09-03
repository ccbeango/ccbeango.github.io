import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, "src", "public");
const markPath = join(publicDir, "favicon.svg");
const mark = await readFile(markPath);

await mkdir(publicDir, { recursive: true });
await sharp(mark).resize(512, 512).png().toFile(join(publicDir, "favicon.png"));

const icoPng = await sharp(mark).resize(64, 64).png().toBuffer();
await writeFile(join(publicDir, "favicon.ico"), await pngToIco(icoPng));

console.log("Generated favicon assets");
