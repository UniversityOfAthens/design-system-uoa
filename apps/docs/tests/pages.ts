// Every page of the built docs site, as URL paths ("/", "/en/components/button/", …).
import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'pagefind' || entry.name === 'uoa' ? [] : htmlFiles(path);
    return entry.name === 'index.html' ? [path] : [];
  });
}

export const pages = htmlFiles(dist)
  .map((file) => '/' + relative(dist, file).split(sep).slice(0, -1).join('/'))
  .map((path) => (path.endsWith('/') ? path : `${path}/`))
  .sort();

if (pages.length === 0) throw new Error(`No pages in ${dist}. Run \`bun run build\` first.`);
