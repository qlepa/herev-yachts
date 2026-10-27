import { describe, expect, test, vi } from 'vitest';
import { blogPageCounts, cleanSummary, getBlogPost, listBlogPage, listBlogPostParams, type BlogPostSummary } from './blog';
import { client, loadQuery } from './client';

vi.mock('./client', () => ({ client: { fetch: vi.fn() }, loadQuery: vi.fn() }));
const mockedLoadQuery = vi.mocked(loadQuery);

// Invisible characters the way stega appends them to strings in draft mode.
const STEGA = '​‌‍﻿'.repeat(8);

describe('cleanSummary', () => {
  test('strips stega from values used in URLs, dates and grouping; keeps display text', () => {
    const post: BlogPostSummary = {
      id: 'abc' + STEGA,
      slug: 'my-post' + STEGA,
      title: 'Title' + STEGA,
      excerpt: 'Excerpt' + STEGA,
      publishedAt: '2026-10-01' + STEGA,
      updatedAt: '2026-10-02T10:00:00Z' + STEGA,
      locale: ('pl' + STEGA) as 'pl',
      translationOf: 'en-id' + STEGA,
    };
    const clean = cleanSummary(post);
    expect(clean).toMatchObject({
      id: 'abc',
      slug: 'my-post',
      publishedAt: '2026-10-01',
      updatedAt: '2026-10-02T10:00:00Z',
      locale: 'pl',
      translationOf: 'en-id',
    });
    expect(clean.title).toBe(post.title);
  });
});

describe('pageCount', () => {
  test('12 posts per page, never fewer than one page', async () => {
    const { pageCount } = await import('./blog');
    expect(pageCount(0)).toBe(1);
    expect(pageCount(12)).toBe(1);
    expect(pageCount(13)).toBe(2);
    expect(pageCount(137)).toBe(12);
  });
});

describe('loaders', () => {
  const summary = (n: number): BlogPostSummary => ({
    id: `post-${n}` + STEGA,
    slug: `slug-${n}` + STEGA,
    title: `Title ${n}`,
    excerpt: '',
    publishedAt: '2026-10-01' + STEGA,
    updatedAt: '2026-10-01' + STEGA,
    locale: ('en' + STEGA) as 'en',
  });

  test('listBlogPage: 1-based page → slice params, cleaned summaries, total pages', async () => {
    mockedLoadQuery.mockResolvedValueOnce({ posts: [summary(1), summary(2)], total: 25 });
    const page = await listBlogPage('en', 2, true);
    expect(mockedLoadQuery).toHaveBeenLastCalledWith(expect.any(String), { locale: 'en', start: 12, end: 24 }, true);
    expect(page.totalPages).toBe(3);
    expect(page.posts.map((p) => p.slug)).toEqual(['slug-1', 'slug-2']);
  });

  test('blogPageCounts: one listing page per language even with zero posts', async () => {
    mockedLoadQuery.mockResolvedValueOnce({ en: 137, pl: 0, es: 13, it: 12 });
    await expect(blogPageCounts(false)).resolves.toEqual({ en: 12, pl: 1, es: 2, it: 1 });
  });

  test('getBlogPost: null when the post does not exist in that language — the caller 404s', async () => {
    mockedLoadQuery.mockResolvedValueOnce(null);
    await expect(getBlogPost('pl', 'nope', false)).resolves.toBeNull();
    expect(mockedLoadQuery).toHaveBeenLastCalledWith(expect.any(String), { locale: 'pl', slug: 'nope' }, false);
  });

  test('getBlogPost: translations are stega-free (they become hreflang URLs)', async () => {
    mockedLoadQuery.mockResolvedValueOnce({
      ...summary(1),
      body: [],
      translations: [
        { locale: 'en' + STEGA, slug: 'slug-1' + STEGA },
        { locale: 'pl' + STEGA, slug: 'slug-1-pl' + STEGA },
      ],
    });
    const post = await getBlogPost('en', 'slug-1', true);
    expect(post?.translations).toEqual([
      { locale: 'en', slug: 'slug-1' },
      { locale: 'pl', slug: 'slug-1-pl' },
    ]);
    expect(post?.id).toBe('post-1');
  });

  test('listBlogPostParams: published posts only, straight from the client', async () => {
    vi.mocked(client.fetch).mockResolvedValueOnce([{ lang: 'en', slug: 'a' }] as never);
    await expect(listBlogPostParams()).resolves.toEqual([{ lang: 'en', slug: 'a' }]);
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('_type == "post"'));
  });
});
