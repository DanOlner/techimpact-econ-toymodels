// Screenshot each section of the report separately. Usage: node scripts/shoot-sections.mjs <url> <outdir> [dark]
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/usr/local/lib/node_modules/playwright");
const [url = "http://127.0.0.1:8001/", out = "/tmp/shots", dark] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: dark ? "dark" : "light" });
await page.goto(url);
await page.waitForSelector("#about", { timeout: 90000 });
await page.evaluate(() => document.querySelectorAll("img").forEach((i) => (i.loading = "eager")));
await page.waitForLoadState("networkidle");
for (const sel of (process.env.SECTIONS ?? "header,#tests,#theta,#charts,#maps,#presets,#tables").split(",")) {
  await page.locator(sel).screenshot({ path: `${out}/${sel.replace("#", "")}${dark ? "-dark" : ""}.png` });
}
// Hover state on the first chart.
const svg = page.locator("#charts svg").first();
await svg.scrollIntoViewIfNeeded();
const box = await svg.boundingBox();
await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.4);
await page.mouse.move(box.x + box.width * 0.21, box.y + box.height * 0.4);
await page.screenshot({ path: `${out}/hover${dark ? "-dark" : ""}.png`, clip: { x: box.x - 20, y: box.y - 20, width: box.width + 40, height: box.height + 40 } });
await browser.close();
console.log("done");
