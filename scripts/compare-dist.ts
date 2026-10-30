// Compares the HTML of two production builds — the check that a CMS
// migration did not change what the site renders.
//
//   node scripts/compare-dist.ts <before-dist> <after-dist>
//   pnpm compare:master   (builds master and HEAD, then compares — scripts/compare-master.ts)
//
// Asset file names under /_astro/ and island uids are ignored. Exit code 1 on any
// difference; prints the first differing fragment per page.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function htmlFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.html'))
    .map((file) => file.split(path.sep).join('/'))
    .sort();
}

// Asset file names (hashes, chunk names) change with unrelated code moves,
// and island uids are derived from them.
export const normalize = (html: string) =>
  html.replace(/\/_astro\/[^"'\s)]+/g, '/_astro/…').replace(/ uid="[^"]*"/g, ' uid="…"');

export function firstDifference(a: string, b: string): string {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  const from = Math.max(0, i - 80);
  return `  before: …${a.slice(from, i + 120)}…\n  after:  …${b.slice(from, i + 120)}…`;
}

export interface Comparison {
  pagesBefore: number;
  pagesAfter: number;
  /** One line per difference: `missing after: …`, `new after: …`, `changed: …` + fragment. */
  differences: string[];
}

export function compareDist(before: string, after: string): Comparison {
  const beforeFiles = new Set(htmlFiles(before));
  const afterFiles = new Set(htmlFiles(after));
  const differences: string[] = [];

  for (const file of beforeFiles) {
    if (!afterFiles.has(file)) {
      differences.push(`missing after: ${file}`);
      continue;
    }
    const a = normalize(fs.readFileSync(path.join(before, file), 'utf8'));
    const b = normalize(fs.readFileSync(path.join(after, file), 'utf8'));
    if (a !== b) differences.push(`changed: ${file}\n${firstDifference(a, b)}`);
  }
  for (const file of afterFiles) {
    if (!beforeFiles.has(file)) differences.push(`new after: ${file}`);
  }
  return { pagesBefore: beforeFiles.size, pagesAfter: afterFiles.size, differences };
}

export function report(result: Comparison): string {
  return [...result.differences, `${result.pagesBefore} pages before, ${result.pagesAfter} after, ${result.differences.length} differences`].join(
    '\n',
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [before, after] = process.argv.slice(2);
  if (!before || !after) throw new Error('Usage: node scripts/compare-dist.ts <before-dist> <after-dist>');
  const result = compareDist(before, after);
  console.log(report(result));
  process.exit(result.differences.length ? 1 : 0);
}
