import { describe, expect, test } from 'vitest';
import { parseVideoUrl } from './video';

describe('parseVideoUrl', () => {
  test('youtube watch URL', () => {
    const v = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(v?.provider).toBe('youtube');
    expect(v?.id).toBe('dQw4w9WgXcQ');
    expect(v?.embedUrl).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(v?.posterUrl).toContain('dQw4w9WgXcQ');
  });

  test('youtu.be short URL', () => {
    expect(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')?.id).toBe('dQw4w9WgXcQ');
  });

  test('vimeo URL', () => {
    const v = parseVideoUrl('https://vimeo.com/1185484138');
    expect(v?.provider).toBe('vimeo');
    expect(v?.embedUrl).toBe('https://player.vimeo.com/video/1185484138?autoplay=1&dnt=1');
    expect(v?.posterUrl).toBeUndefined();
  });

  test('unsupported host or garbage returns null', () => {
    expect(parseVideoUrl('https://example.com/video')).toBeNull();
    expect(parseVideoUrl('not a url')).toBeNull();
  });
});
