import { describe, expect, test } from 'vitest';
import { JSDOM } from 'jsdom';
import { convertPost, humanizeAuthor, rewriteHref, truncate, wixOriginalUrl } from './convert';

function page(body: string, ld: Record<string, unknown> = {}): Document {
  const json = JSON.stringify({
    '@type': 'BlogPosting',
    headline: 'Galeon 570 SKY',
    description: 'Short description.',
    datePublished: '2026-06-27T11:31:46.451Z',
    dateModified: '2026-07-01T08:00:00.000Z',
    author: { '@type': 'Person', name: 'Max Kowalsky' },
    image: { url: 'https://static.wixstatic.com/media/7f2a4a_cover~mv2.png/v1/fill/w_1000,h_473/x.png' },
    ...ld,
  });
  return new JSDOM(`<html><head><script type="application/ld+json">${json}</script></head><body>
    <nav data-hook="header-navigation__/categories/poland"><a href="https://www.yachts24.eu/blog/categories/poland">Poland</a></nav>
    <div data-hook="post-description">${body}</div>
    <footer><a href="https://www.yachts24.eu/blog/categories/yachts">Yachts</a>
    <a href="https://www.yachts24.eu/blog/categories/yacht-broker">Yacht broker</a></footer>
  </body></html>`).window.document;
}

const text = (b: { children?: Array<{ text: string }> }) => b.children?.map((c) => c.text).join('');

describe('convertPost', () => {
  test('metadata from JSON-LD, categories from post links (not the blog menu)', () => {
    const p = convertPost(page('<p>Body.</p>'), 'galeon-570-sky');
    expect(p).toMatchObject({
      title: 'Galeon 570 SKY',
      author: 'Max Kowalsky',
      publishedAt: '2026-06-27',
      modifiedAt: '2026-07-01',
      categories: ['Yachts', 'Yacht broker'],
      coverUrl: 'https://static.wixstatic.com/media/7f2a4a_cover~mv2.png',
    });
  });

  test('paragraphs, headings, marks and links', () => {
    const p = convertPost(
      page(
        '<h2>Heading</h2><p>A <strong>bold</strong> and <em>italic</em> <a href="https://www.yachts24.eu/post/other">link</a>.</p><h4>Small</h4>',
      ),
      's',
      new Set(['other']),
    );
    const [h2, para, h4] = p.body as Array<{ style: string; children: Array<{ text: string; marks: string[] }>; markDefs: Array<{ href: string; _key: string }> }>;
    expect(h2.style).toBe('h2');
    expect(h4.style).toBe('h3');
    expect(para.children.map((c) => [c.text, c.marks.length ? c.marks[0] : ''])).toEqual([
      ['A ', ''],
      ['bold', 'strong'],
      [' and ', ''],
      ['italic', 'em'],
      [' ', ''],
      ['link', para.markDefs[0]._key],
      ['.', ''],
    ]);
    expect(para.markDefs[0].href).toBe('/en/blog/other/');
  });

  test('lists with paragraphs inside items, nested levels and numbering', () => {
    const p = convertPost(
      page('<ul><li><p>One</p><ol><li><p>Nested</p></li></ol></li><li><p>Two</p></li></ul>'),
      's',
    );
    expect(p.body.map((b) => [text(b as never), (b as { listItem?: string }).listItem, (b as { level?: number }).level])).toEqual([
      ['One', 'bullet', 1],
      ['Nested', 'number', 2],
      ['Two', 'bullet', 1],
    ]);
  });

  test('images keep alt and caption; videos and empty paragraphs are reported or skipped', () => {
    const p = convertPost(
      page(`<p> </p>
        <figure><img src="https://static.wixstatic.com/media/a_b~mv2.jpg/v1/fill/w_1/a.jpg" alt=""><figcaption>Cockpit</figcaption></figure>
        <figure><video src="https://video.wixstatic.com/video/x/1080p/mp4/file.mp4"></video></figure>`),
      's',
    );
    expect(p.body).toEqual([
      expect.objectContaining({ _type: 'image', sourceUrl: 'https://static.wixstatic.com/media/a_b~mv2.jpg', alt: 'Cockpit', caption: 'Cockpit' }),
    ]);
    expect(p.warnings[0]).toContain('file.mp4');
  });

  test('drops a first paragraph that only repeats the description', () => {
    const p = convertPost(page('<p>Short   description.</p><p>Rest.</p>'), 's');
    expect(p.body.map((b) => text(b as never))).toEqual(['Rest.']);
  });

  test('decodes HTML entities Wix leaves in JSON-LD', () => {
    const p = convertPost(page('<p>x</p>', { headline: 'Pros, Cons &amp; Myths&#010;' }), 's');
    expect(p.title).toBe('Pros, Cons & Myths');
  });

  test('external videos (no file in the HTML) are reported, not dropped silently', () => {
    const p = convertPost(page('<figure data-hook="figure-VIDEO"><button aria-label="Play video"></button><figcaption>Best of 2024</figcaption></figure>'), 's');
    expect(p.body).toEqual([]);
    expect(p.warnings[0]).toContain('Best of 2024');
  });

  test('stable block keys across runs', () => {
    const a = convertPost(page('<p>x</p><p>y</p>'), 's');
    const b = convertPost(page('<p>x</p><p>y</p>'), 's');
    expect(a.body.map((x) => x._key)).toEqual(b.body.map((x) => x._key));
  });
});

describe('helpers', () => {
  test('wixOriginalUrl strips the transform', () => {
    expect(wixOriginalUrl('https://static.wixstatic.com/media/7f2a4a_x~mv2.avif/v1/fill/w_320/a.avif')).toBe(
      'https://static.wixstatic.com/media/7f2a4a_x~mv2.avif',
    );
    expect(wixOriginalUrl('https://i.ytimg.com/vi/x/maxres.jpg')).toBeUndefined();
  });

  test('truncate at a word boundary', () => {
    expect(truncate('one two three', 20)).toBe('one two three');
    expect(truncate('one two three four', 12)).toBe('one two…');
    expect(truncate('one two three four', 12).length).toBeLessThanOrEqual(12);
  });

  test('humanizeAuthor only touches slug-like names', () => {
    expect(humanizeAuthor('angelika-gluszek')).toBe('Angelika Gluszek');
    expect(humanizeAuthor('Max Kowalsky')).toBe('Max Kowalsky');
  });

  test('rewriteHref only for imported posts', () => {
    const imported = new Set(['a']);
    expect(rewriteHref('https://www.yachts24.eu/post/a?x=1', imported)).toBe('/en/blog/a/');
    expect(rewriteHref('https://www.yachts24.eu/post/b', imported)).toBe('https://www.yachts24.eu/post/b');
    expect(rewriteHref('https://galeonyachts.com', imported)).toBe('https://galeonyachts.com');
  });
});
