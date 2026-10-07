import { describe, expect, test, vi } from 'vitest';
import { cleanSummary, type BlogPostSummary } from './blog';

vi.mock('./client', () => ({ client: {}, loadQuery: vi.fn() }));

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
