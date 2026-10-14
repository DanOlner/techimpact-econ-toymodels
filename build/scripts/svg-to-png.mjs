// Render SVG files to PNG with Playwright, to check static images. Usage: node scripts/svg-to-png.mjs out_dir file.svg ...
import { createRequire } from "node:module";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("/usr/local/lib/node_modules/playwright");
const [out, ...files] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 450 }, deviceScaleFactor: 1 });
for (const f of files) {
  await page.goto(pathToFileURL(f).href);
  await page.locator("svg").screenshot({ path: `${out}/${basename(f, ".svg")}.png` });
}
await browser.close();
