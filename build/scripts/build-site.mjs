// Build the site. Each stage is published in its own folder, docs/<stage id>/, and a completed
// stage is frozen: it's never rebuilt, so the page stays as it was when the stage was done.
// docs/index.html is a landing page listing every stage, written from site-stages.json.
//
// Usage: node scripts/build-site.mjs [stage id] [--force]
//   With no stage id, builds the first stage that isn't frozen. Always rewrites the landing page.
//   --landing-only rewrites just the landing page.
//   --force rebuilds a frozen stage; use only to fix a broken page, and say so in the build log.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const site = JSON.parse(readFileSync(join(root, "site-stages.json"), "utf8"));
const args = process.argv.slice(2);
const force = args.includes("--force");
const wanted = args.find((a) => !a.startsWith("--"));
const landingOnly = args.includes("--landing-only");

const stage = wanted ? site.stages.find((s) => s.id === wanted) : site.stages.find((s) => !s.frozen);
if (!landingOnly) {
  if (!stage) throw new Error(wanted ? `No stage ${wanted} in site-stages.json` : "Every stage is frozen; add a new one to site-stages.json");
  const out = join(root, "docs", stage.id);
  if (stage.frozen && existsSync(join(out, "index.html")) && !force) {
    throw new Error(`${stage.id} is frozen and already published; pass --force to rebuild it`);
  }
  if (stage.generate) execFileSync("npx", ["tsx", stage.generate], { cwd: root, stdio: "inherit" });
  execFileSync("npx", ["vite", "build", "--outDir", out, "--emptyOutDir"], { cwd: root, stdio: "inherit", env: { ...process.env, SITE_STAGE: stage.id, SITE_STAGE_TITLE: stage.title } });
  console.log(`Built ${stage.id} into docs/${stage.id}/`);
}

// Landing page.
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const items = site.stages
  .map((s) => {
    const published = existsSync(join(root, "docs", s.id, "index.html"));
    const status = s.frozen ? `Completed ${esc(s.completed ?? "")}` : published ? "In progress: this page is updated as the stage is built" : "Not yet published";
    const title = published ? `<a href="${s.id}/">${esc(s.title)}</a>` : esc(s.title);
    return `<li><h2>${title}</h2><p class="status">${status}</p><p>${esc(s.summary)}</p></li>`;
  })
  .join("\n");
mkdirSync(join(root, "docs"), { recursive: true });
writeFileSync(
  join(root, "docs", "index.html"),
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.title)}</title>
<style>
:root{color-scheme:light;--page:#f9f9f7;--surface:#fcfcfb;--ink:#0b0b0b;--ink2:#52514e;--muted:#898781;--border:rgba(11,11,11,.1);--link:#2a78d6}
@media (prefers-color-scheme:dark){:root{color-scheme:dark;--page:#0d0d0d;--surface:#1a1a19;--ink:#fff;--ink2:#c3c2b7;--border:rgba(255,255,255,.1);--link:#3987e5}}
body{margin:0;background:var(--page);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:860px;margin:0 auto;padding:32px 24px 64px}h1{font-size:28px;margin:0 0 8px}p{color:var(--ink2);max-width:75ch}
ol{list-style:none;padding:0;margin:24px 0 0;display:grid;gap:12px}ol li{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px 20px}
h2{font-size:18px;margin:4px 0}.about h2,.stages-head{font-size:20px;margin:28px 0 8px}.links{color:var(--ink2);padding-left:20px}.links li{margin:4px 0}a{color:var(--link)}.status{color:var(--muted);font-size:13px;margin:0}
</style></head>
<body><main><h1>${esc(site.title)}</h1><p>${esc(site.intro)}</p>
<section class="about">
<h2>What this is</h2>
${(site.about ?? []).map((t) => `<p>${esc(t)}</p>`).join("\n")}
<ul class="links">
${(site.links ?? []).map((l) => `<li><a href="${esc(l.url)}">${esc(l.label)}</a>: ${esc(l.note)}${l.extraUrl ? ` <a href="${esc(l.extraUrl)}">${esc(l.extraLabel)}</a>` : ""}.</li>`).join("\n")}
</ul>
</section>
<h2 class="stages-head">Stages of the build</h2>
<ol>
${items}
</ol></main></body></html>
`,
);
console.log("Wrote docs/index.html (landing page)");
