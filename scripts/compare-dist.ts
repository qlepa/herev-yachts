// Compares the HTML of two production builds — the check that a CMS
// migration did not change what the site renders.
//
//   node scripts/compare-dist.ts <before-dist> <after-dist>
//
// Asset file names under /_astro/ and island uids are ignored. Exit code 1 on any
// difference; prints the first differing fragment per page.

import fs from 'node:fs';
import path from 'node:path';

const [before, after] = process.argv.slice(2);
if (!before || !after) throw new Error('Usage: node scripts/compare-dist.ts <before-dist> <after-dist>');

function htmlFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.html'))
    .map((file) => file.split(path.sep).join('/'))
    .sort();
}

// Asset file names (hashes, chunk names) change with unrelated code moves,
// and island uids are derived from them.
const normalize = (html: string) =>
  html.replace(/\/_astro\/[^"'\s)]+/g, '/_astro/…').replace(/ uid="[^"]*"/g, ' uid="…"');

function firstDifference(a: string, b: string): string {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  const from = Math.max(0, i - 80);
  return `  before: …${a.slice(from, i + 120)}…\n  after:  …${b.slice(from, i + 120)}…`;
}

const beforeFiles = new Set(htmlFiles(before));
const afterFiles = new Set(htmlFiles(after));
let differences = 0;

for (const file of beforeFiles) {
  if (!afterFiles.has(file)) {
    console.log(`missing after: ${file}`);
    differences++;
    continue;
  }
  const a = normalize(fs.readFileSync(path.join(before, file), 'utf8'));
  const b = normalize(fs.readFileSync(path.join(after, file), 'utf8'));
  if (a !== b) {
    console.log(`changed: ${file}\n${firstDifference(a, b)}`);
    differences++;
  }
}
for (const file of afterFiles) {
  if (!beforeFiles.has(file)) {
    console.log(`new after: ${file}`);
    differences++;
  }
}

console.log(`${beforeFiles.size} pages before, ${afterFiles.size} after, ${differences} differences`);
process.exit(differences ? 1 : 0);
