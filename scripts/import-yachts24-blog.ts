// Imports every post from the yachts24.eu (Wix) blog into Sanity as English
// `post` documents. Idempotent: fixed document ids (`yachts24-<slug>`), so a
// re-run replaces the same documents; images are cached by source URL.
//
//   npx sanity exec scripts/import-yachts24-blog.ts --with-user-token -- --dataset development
//
// Flags: --dataset <name> (required), --dry-run (convert + report, no writes).
// Downloads are cached in .cache/yachts24/; the report lands in
// docs/yachts24-import-report.md.
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { getCliClient } from 'sanity/cli';
import { convertPost, truncate, type ConvertedPost } from './yachts24/convert';

const SITE = 'https://www.yachts24.eu';
const CACHE = path.resolve('.cache/yachts24');
const REPORT = path.resolve('docs/yachts24-import-report.md');
const ASSET_CACHE = path.join(CACHE, 'assets.json');

const args = process.argv.slice(2);
const dataset = args[args.indexOf('--dataset') + 1];
const dryRun = args.includes('--dry-run');
if (!args.includes('--dataset') || !dataset) throw new Error('Pass --dataset <name>');

const client = getCliClient({ apiVersion: '2026-08-24' }).withConfig({ dataset });
fs.mkdirSync(CACHE, { recursive: true });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url: string, accept: (res: Response, body: Buffer) => boolean): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (herev blog migration)' } });
    const body = Buffer.from(await res.arrayBuffer());
    if (res.ok && accept(res, body)) return body;
    if (attempt === 4) throw new Error(`${url}: HTTP ${res.status} after ${attempt} attempts`);
    await sleep(1000 * attempt);
  }
}

// Wix occasionally serves a page shell without the post; only accept full posts.
const hasPost = (html: string) => html.includes('data-hook="post-description"') && html.includes('"BlogPosting"');

async function postSlugs(): Promise<string[]> {
  const xml = (await fetchWithRetry(`${SITE}/blog-posts-sitemap.xml`, () => true)).toString('utf8');
  return [...xml.matchAll(/<loc>[^<]*\/post\/([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function postHtml(slug: string): Promise<string> {
  const file = path.join(CACHE, `${slug}.html`);
  if (fs.existsSync(file) && hasPost(fs.readFileSync(file, 'utf8'))) return fs.readFileSync(file, 'utf8');
  const body = await fetchWithRetry(`${SITE}/post/${slug}`, (_, b) => hasPost(b.toString('utf8')));
  fs.writeFileSync(file, body);
  await sleep(500);
  return body.toString('utf8');
}

const assetCache: Record<string, string> = fs.existsSync(ASSET_CACHE)
  ? JSON.parse(fs.readFileSync(ASSET_CACHE, 'utf8'))
  : {};

/** Uploads an image once per source URL and dataset; returns the asset id. */
async function uploadImage(sourceUrl: string): Promise<string> {
  const cacheKey = `${dataset}:${sourceUrl}`;
  if (assetCache[cacheKey]) return assetCache[cacheKey];
  // AVIF originals are fetched as JPEG through Wix's transform (capped at 2560 px).
  const downloadUrl = sourceUrl.endsWith('.avif') ? `${sourceUrl}/v1/fit/w_2560,h_2560,q_90/file.jpg` : sourceUrl;
  const buffer = await fetchWithRetry(downloadUrl, (res) => (res.headers.get('content-type') ?? '').startsWith('image/'));
  const filename = decodeURIComponent(downloadUrl.split('/').pop() ?? 'image').replace(/~mv2/, '');
  const asset = await client.assets.upload('image', buffer, {
    filename,
    source: { name: 'yachts24.eu', id: sourceUrl, url: sourceUrl },
  });
  assetCache[cacheKey] = asset._id;
  fs.writeFileSync(ASSET_CACHE, JSON.stringify(assetCache, null, 1));
  return asset._id;
}

const imageRef = (assetId: string) => ({ _type: 'reference' as const, _ref: assetId });

async function toDocument(post: ConvertedPost) {
  const firstParagraph = post.body.find((b) => b._type === 'block' && !b.listItem);
  const excerptSource =
    post.description ||
    (firstParagraph?._type === 'block' ? firstParagraph.children.map((c) => c.text).join('') : post.title);

  // Upload the post's images a few at a time (Wix originals are large).
  const urls = [...new Set([...post.body.flatMap((b) => (b._type === 'image' ? [b.sourceUrl] : [])), ...(post.coverUrl ? [post.coverUrl] : [])])];
  const assetIds = new Map<string, string>();
  for (let i = 0; i < urls.length; i += 4) {
    const batch = urls.slice(i, i + 4);
    const ids = await Promise.all(batch.map((u) => (dryRun ? 'dry-run' : uploadImage(u))));
    batch.forEach((u, j) => assetIds.set(u, ids[j]));
  }

  const body = post.body.map((block) => {
    if (block._type !== 'image') return block;
    const { sourceUrl, ...rest } = block;
    return { ...rest, asset: imageRef(assetIds.get(sourceUrl)!) };
  });

  return {
    _id: `yachts24-${post.slug}`,
    _type: 'post',
    title: post.title,
    slug: { _type: 'slug', current: post.slug },
    locale: 'en',
    excerpt: truncate(excerptSource, 200),
    ...(post.author ? { author: post.author } : {}),
    publishedAt: post.publishedAt,
    ...(post.modifiedAt ? { modifiedAt: post.modifiedAt } : {}),
    ...(post.categories.length ? { categories: post.categories } : {}),
    ...(post.coverUrl
      ? { image: { _type: 'image', asset: imageRef(assetIds.get(post.coverUrl)!), alt: post.title } }
      : {}),
    body,
  };
}

const slugs = await postSlugs();
const imported = new Set(slugs);
console.log(`${slugs.length} posts in the sitemap → dataset "${dataset}"${dryRun ? ' (dry run)' : ''}`);

const report: string[] = [];
let done = 0;
let images = 0;
for (const slug of slugs) {
  const html = await postHtml(slug);
  const doc = new JSDOM(html, { virtualConsole: new VirtualConsole() }).window.document;
  const post = convertPost(doc, slug, imported);
  const document = await toDocument(post);
  images += post.body.filter((b) => b._type === 'image').length + (post.coverUrl ? 1 : 0);
  if (!dryRun) await client.createOrReplace(document);
  if (post.warnings.length || !post.coverUrl || !post.categories.length) {
    report.push(`- [ ] **${post.title}** — \`/en/blog/${slug}/\` (oryginał: ${SITE}/post/${slug})`);
    for (const w of post.warnings) report.push(`  - ${w}`);
    if (!post.coverUrl) report.push('  - brak zdjęcia głównego');
    if (!post.categories.length) report.push('  - brak kategorii');
  }
  done++;
  if (done % 10 === 0) console.log(`  ${done}/${slugs.length}`);
}

fs.writeFileSync(
  REPORT,
  `# Import bloga z yachts24.eu — raport

Wygenerowane przez \`scripts/import-yachts24-blog.ts\` (dataset \`${dataset}\`,
${new Date().toISOString().slice(0, 10)}). Posty: ${done}, zdjęcia: ${images}.

Do ręcznego uzupełnienia w Studio (wideo i osadzenia Wix nie dają się
przenieść automatycznie):

${report.join('\n') || 'Brak.'}
`,
);
console.log(`Done: ${done} posts, ${images} images. Report: ${path.relative(process.cwd(), REPORT)}`);
