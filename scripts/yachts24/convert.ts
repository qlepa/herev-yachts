// Converts a yachts24.eu (Wix Blog) post page into a Sanity `post` draft.
// Pure: no network. Images are returned as source URLs; the import script
// uploads them and swaps in asset references.
import { createHash } from 'node:crypto';

export interface Span {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}
export interface TextBlock {
  _type: 'block';
  _key: string;
  style: 'normal' | 'h2' | 'h3' | 'blockquote';
  listItem?: 'bullet' | 'number';
  level?: number;
  markDefs: Array<{ _type: 'link'; _key: string; href: string }>;
  children: Span[];
}
export interface ImageBlock {
  _type: 'image';
  _key: string;
  sourceUrl: string;
  alt: string;
  caption?: string;
}
export type BodyBlock = TextBlock | ImageBlock;

export interface ConvertedPost {
  slug: string;
  title: string;
  description: string;
  author?: string;
  publishedAt: string;
  modifiedAt?: string;
  categories: string[];
  coverUrl?: string;
  body: BodyBlock[];
  /** Things that could not be carried over, for the import report. */
  warnings: string[];
}

const BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, figure';
const CATEGORY_NAMES: Record<string, string> = {
  yachts: 'Yachts',
  'yacht-broker': 'Yacht broker',
  'yacht-registration': 'Yacht registration',
  'sailing-news': 'Sailing news',
  cruising: 'Cruising',
  poland: 'Poland',
};

export function keyFor(...parts: Array<string | number>): string {
  return createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 12);
}

/** Wix CDN URL of the original upload (drops the /v1/fill/... transform). */
export function wixOriginalUrl(src: string): string | undefined {
  const m = src.match(/^https?:\/\/static\.wixstatic\.com\/media\/([^/?#]+)/);
  return m ? `https://static.wixstatic.com/media/${m[1]}` : undefined;
}

/** Shortens to at most `max` characters at a word boundary, adding an ellipsis. */
export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const atWord = cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.–-]+$/, '');
  return `${atWord || cut}…`;
}

function inlineSpans(
  el: Element,
  blockKey: string,
  markDefs: TextBlock['markDefs'],
  skip?: (node: Element) => boolean,
): Span[] {
  const spans: Array<{ text: string; marks: string[] }> = [];
  const walk = (node: Node, marks: string[]) => {
    if (node.nodeType === 3) {
      spans.push({ text: node.textContent ?? '', marks });
      return;
    }
    if (node.nodeType !== 1) return;
    const child = node as Element;
    if (skip?.(child)) return;
    const tag = child.tagName.toLowerCase();
    if (tag === 'br') {
      spans.push({ text: '\n', marks });
      return;
    }
    let next = marks;
    if (tag === 'strong' || tag === 'b') next = [...marks, 'strong'];
    else if (tag === 'em' || tag === 'i') next = [...marks, 'em'];
    else if (tag === 'a' && child.getAttribute('href')) {
      const href = child.getAttribute('href')!;
      const key = keyFor(blockKey, 'link', markDefs.length);
      markDefs.push({ _type: 'link', _key: key, href });
      next = [...marks, key];
    }
    for (const c of Array.from(child.childNodes)) walk(c, next);
  };
  walk(el, []);

  // Merge neighbours with identical marks, trim the block edges.
  const merged: Array<{ text: string; marks: string[] }> = [];
  for (const s of spans) {
    const last = merged.at(-1);
    if (last && last.marks.join() === s.marks.join()) last.text += s.text;
    else merged.push({ ...s, marks: [...new Set(s.marks)] });
  }
  if (merged.length) {
    merged[0].text = merged[0].text.replace(/^\s+/, '');
    merged[merged.length - 1].text = merged[merged.length - 1].text.replace(/\s+$/, '');
  }
  return merged
    .filter((s) => s.text.length > 0)
    .map((s, i) => ({ _type: 'span', _key: keyFor(blockKey, 'span', i), text: s.text, marks: s.marks }));
}

function textBlock(
  el: Element,
  key: string,
  style: TextBlock['style'],
  list?: { listItem: 'bullet' | 'number'; level: number },
  skip?: (node: Element) => boolean,
): TextBlock | null {
  const markDefs: TextBlock['markDefs'] = [];
  const children = inlineSpans(el, key, markDefs, skip);
  if (!children.some((s) => s.text.trim())) return null;
  const usedMarks = new Set(children.flatMap((s) => s.marks));
  return {
    _type: 'block',
    _key: key,
    style,
    ...(list ?? {}),
    markDefs: markDefs.filter((d) => usedMarks.has(d._key)),
    children,
  };
}

/** "angelika-gluszek" → "Angelika Gluszek"; proper names pass through. */
export function humanizeAuthor(name: string): string {
  if (/\s/.test(name) || !/-/.test(name)) return name;
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Links to other imported posts point at their new blog URL; the rest stay as they are. */
export function rewriteHref(href: string, importedSlugs: ReadonlySet<string>): string {
  const m = href.match(/^https?:\/\/(?:www\.)?yachts24\.eu\/post\/([^/?#]+)/);
  return m && importedSlugs.has(m[1]) ? `/en/blog/${m[1]}/` : href;
}

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();

export function convertPost(
  doc: Document,
  slug: string,
  importedSlugs: ReadonlySet<string> = new Set(),
): ConvertedPost {
  const warnings: string[] = [];
  const ld = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
    .map((s) => {
      try {
        return JSON.parse(s.textContent ?? '');
      } catch {
        return null;
      }
    })
    .find((j) => j?.['@type'] === 'BlogPosting');
  if (!ld) throw new Error(`${slug}: no BlogPosting JSON-LD`);

  const root = doc.querySelector('[data-hook="post-description"]');
  if (!root) throw new Error(`${slug}: no post body`);

  // Wix escapes HTML inside JSON-LD strings ("Pros &amp; Cons").
  const decode = (s: unknown) => {
    const t = doc.createElement('textarea');
    t.innerHTML = String(s ?? '');
    return normalize(t.value);
  };
  const title = decode(ld.headline);

  const categories = [
    ...new Set(
      Array.from(doc.querySelectorAll('a[href*="/blog/categories/"]'))
        .filter((a) => !a.closest('[data-hook^="header-navigation"], nav'))
        .map((a) => a.getAttribute('href')!.split('/blog/categories/')[1]?.replace(/[/?#].*$/, ''))
        .map((c) => (c ? CATEGORY_NAMES[c] : undefined))
        .filter((c): c is string => Boolean(c)),
    ),
  ];

  const blocks: BodyBlock[] = [];
  const isList = (e: Element) => ['ul', 'ol'].includes(e.tagName.toLowerCase());

  const addList = (list: Element, level: number) => {
    const listItem = list.tagName.toLowerCase() === 'ol' ? 'number' : 'bullet';
    for (const li of Array.from(list.children).filter((c) => c.tagName.toLowerCase() === 'li')) {
      const b = textBlock(li, keyFor(slug, blocks.length), 'normal', { listItem, level }, isList);
      if (b) blocks.push(b);
      for (const nested of Array.from(li.querySelectorAll(':scope > ul, :scope > ol'))) addList(nested, level + 1);
    }
  };

  // Outermost blocks only: <p> inside <li>/<blockquote> belongs to its parent.
  const topLevel = Array.from(root.querySelectorAll(BLOCK_SELECTOR)).filter(
    (el) => !el.parentElement?.closest(BLOCK_SELECTOR),
  );
  for (const el of topLevel) {
    const tag = el.tagName.toLowerCase();
    const key = keyFor(slug, blocks.length);
    if (tag === 'figure') {
      const video = el.querySelector('video')?.getAttribute('src');
      if (video) {
        warnings.push(`video not carried over (upload to Vimeo and add): ${video}`);
        continue;
      }
      if (el.getAttribute('data-hook') === 'figure-VIDEO') {
        const caption = el.querySelector('figcaption')?.textContent?.trim();
        warnings.push(`external video (e.g. YouTube) not carried over — check the original${caption ? `: "${caption}"` : ''}`);
        continue;
      }
      const img = el.querySelector('img');
      const src = img && wixOriginalUrl(img.getAttribute('src') ?? '');
      if (!src) {
        warnings.push('figure without a Wix image skipped');
        continue;
      }
      const caption = el.querySelector('figcaption')?.textContent?.trim() || undefined;
      const alt = img.getAttribute('alt')?.trim() || caption || title;
      blocks.push({ _type: 'image', _key: key, sourceUrl: src, alt, ...(caption ? { caption } : {}) });
    } else if (tag === 'ul' || tag === 'ol') {
      addList(el, 1);
    } else {
      const style = tag === 'blockquote' ? 'blockquote' : tag === 'h1' || tag === 'h2' ? 'h2' : tag.startsWith('h') ? 'h3' : 'normal';
      const b = textBlock(el, key, style);
      if (b) blocks.push(b);
    }
  }

  const embeds = root.querySelectorAll('[data-hook="html-component"], iframe').length;
  if (embeds) warnings.push(`${embeds} embedded HTML block(s) not carried over (rendered by Wix in the browser — check the original)`);

  for (const b of blocks) if (b._type === 'block') for (const d of b.markDefs) d.href = rewriteHref(d.href, importedSlugs);

  const description = decode(ld.description);
  // Wix often uses the first paragraph as the description; the post page
  // shows the excerpt as a lead, so drop the copy when nothing would be lost.
  const first = blocks[0];
  if (
    first?._type === 'block' &&
    !first.listItem &&
    description.length <= 200 &&
    normalize(first.children.map((c) => c.text).join('')) === description
  ) {
    blocks.shift();
  }

  const coverSrc: string = ld.image?.url ?? '';
  return {
    slug,
    title,
    description,
    author: ld.author?.name ? humanizeAuthor(decode(ld.author.name)) : undefined,
    publishedAt: String(ld.datePublished).slice(0, 10),
    // Always set: otherwise the site would show the import date as the last update.
    modifiedAt: String(ld.dateModified ?? ld.datePublished).slice(0, 10),
    categories,
    coverUrl: wixOriginalUrl(coverSrc) ?? (/^https?:\/\//.test(coverSrc) ? coverSrc : undefined),
    body: blocks,
    warnings,
  };
}
