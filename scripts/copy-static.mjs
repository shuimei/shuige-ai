import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

// Everything the browser needs, copied verbatim. The single generated file is
// dist/assets/main.css, which the Tailwind step writes after this runs.
const entries = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'en', 'assets'];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  const from = resolve(root, entry);
  if (!existsSync(from)) {
    console.warn(`skip (missing): ${entry}`);
    continue;
  }
  await cp(from, resolve(dist, entry), { recursive: true });
  console.log(`copied: ${entry}`);
}
