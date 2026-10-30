import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { parse, type HTMLElement } from 'node-html-parser';
import { LOCALES, type Locale } from '../../lib/i18n';

/**
 * Shared loader for the `dist` project (docs/testing-strategy.md §3 L3):
 * every HTML page of the production build, parsed once.
 *
 * Run `pnpm build` (with `SANITY_PREVIEW=false`) first — `pnpm verify` does.
 */
export const ROOT = path.resolve(import.meta.dirname, '../../..');
export const DIST = path.join(ROOT, 'dist/client');
export const SITE = 'https://herev.com';

export interface Page {
  /** Path relative to dist/client, posix separators. */
  file: string;
  /** URL path, e.g. `/en/yachts/galeon/galeon-500-fly/`. */
  route: string;
  lang: Locale;
  html: string;
  dom: HTMLElement;
}

let cache: Page[] | undefined;

function listFiles(dir: string, ext: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith(ext))
    .map((f) => f.split(path.sep).join('/'))
    .sort();
}

export function routeOf(file: string): string {
  return '/' + file.replace(/index\.html$/, '');
}

/**
 * All locale pages (`/{lang}/…`). The root `index.html` is Astro's redirect
 * stub for `/` → `/en/` and is deliberately not a page.
 */
export function pages(): Page[] {
  if (cache) return cache;
  if (!existsSync(DIST)) {
    throw new Error(`${DIST} not found — run \`pnpm build\` before \`pnpm test:dist\``);
  }
  cache = listFiles(DIST, '.html')
    .filter((f) => f !== 'index.html')
    .map((file) => {
      const html = readFileSync(path.join(DIST, file), 'utf8');
      const lang = file.split('/')[0] as Locale;
      if (!LOCALES.includes(lang)) throw new Error(`page outside a locale: ${file}`);
      return { file, route: routeOf(file), lang, html, dom: parse(html) };
    });
  return cache;
}

export const is404 = (p: Page) => /^\/[a-z]{2}\/404\/$/.test(p.route);
export const isBlogPost = (p: Page) => /^\/[a-z]{2}\/blog\/(?!page\/)[^/]+\/$/.test(p.route);
export const isBlog = (p: Page) => /^\/[a-z]{2}\/blog\//.test(p.route);

export const routes = () => new Set(pages().map((p) => p.route));

/** Client bundle chunks. */
export function clientScripts(): Array<{ file: string; source: string }> {
  const dir = path.join(DIST, '_astro');
  return listFiles(dir, '.js').map((file) => ({ file, source: readFileSync(path.join(dir, file), 'utf8') }));
}

/** The file a site-absolute URL path (no origin) is served from, or null. */
export function fileForPath(urlPath: string): string | null {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const candidates = clean.endsWith('/')
    ? [path.join(DIST, clean, 'index.html')]
    : [path.join(DIST, clean), path.join(DIST, clean, 'index.html')];
  return candidates.find((c) => existsSync(c)) ?? null;
}

/** `vercel.json` redirect sources as regexes (`:lang(en|pl)`, `:path*`, `:name`). */
export function redirectMatchers(): RegExp[] {
  const json = JSON.parse(readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')) as {
    redirects: Array<{ source: string }>;
  };
  return json.redirects.map(
    (r) =>
      new RegExp(
        '^' +
          r.source
            .replace(/\/:[A-Za-z]+\*/g, '(?:/.*)?')
            .replace(/:[A-Za-z]+\(([^)]+)\)/g, '($1)')
            .replace(/:[A-Za-z]+/g, '[^/]+') +
          '$',
      ),
  );
}

/** Build-time env the way astro.config reads it: process env first, then `.env`. */
export function buildEnv(name: string): string | undefined {
  if (process.env[name] !== undefined) return process.env[name];
  const envFile = path.join(ROOT, '.env');
  if (!existsSync(envFile)) return undefined;
  return parseEnv(readFileSync(envFile, 'utf8'))[name];
}

/** Flat YAML front matter (`key: value`, `key:` + `- item`) of a content file. */
export function frontmatter(file: string): Record<string, string | string[]> {
  const src = readFileSync(file, 'utf8');
  const block = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const out: Record<string, string | string[]> = {};
  let listKey: string | undefined;
  for (const line of block.split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      (out[listKey] as string[]).push(item[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    if (kv[2] === '') {
      listKey = kv[1];
      out[kv[1]] = [];
    } else {
      listKey = undefined;
      out[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return out;
}

export function contentEntries(collection: 'yachts' | 'stock' | 'brands' | 'dealers') {
  const base = path.join(ROOT, 'src/content', collection);
  return listFiles(base, '.md').map((file) => ({
    id: file.replace(/\.md$/, ''),
    lang: file.split('/')[0] as Locale,
    data: frontmatter(path.join(base, file)),
  }));
}

/**
 * Astro serialises island props as `[type, value]` pairs (type 0 = plain
 * value). Returns the plain object.
 */
export function islandProps(island: HTMLElement): unknown {
  const raw = island.getAttribute('props');
  if (!raw) return undefined;
  const revive = (v: unknown): unknown => {
    if (Array.isArray(v) && v.length <= 2 && typeof v[0] === 'number') {
      if (v[0] === 0) return revive(v[1]);
      if (v[0] === 1) return (v[1] as unknown[]).map(revive);
      return v[1];
    }
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, revive(x)]));
    }
    return v;
  };
  return revive(JSON.parse(raw));
}
