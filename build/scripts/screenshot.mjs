// Screenshot a page with the container's Playwright 1.63.0 and print any console errors.
// Usage: node scripts/screenshot.mjs <url> <out.png>
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/usr/local/lib/node_modules/playwright");

const [url = "http://127.0.0.1:8000/", out = "/tmp/shot.png"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector(process.env.WAIT_FOR ?? "body", { timeout: 60000 });
await page.screenshot({ path: out, fullPage: true });
console.log(`saved ${out}; console errors: ${errors.length ? errors.join(" | ") : "none"}`);
await browser.close();
