import { describe, expect, test } from 'vitest';
import { backgroundVideoProblem, parseVideoUrl } from './video';

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

describe('backgroundVideoProblem', () => {
  test('Vimeo file links are accepted', () => {
    expect(
      backgroundVideoProblem(
        'https://player.vimeo.com/progressive_redirect/playback/1185484138/rendition/1080p/file.mp4?loc=external&signature=abc',
      ),
    ).toBeNull();
    expect(backgroundVideoProblem('https://player.vimeo.com/external/1185484138.hd.mp4?s=abc')).toBeNull();
  });

  test('a Vimeo page link explains where to find the file link', () => {
    expect(backgroundVideoProblem('https://vimeo.com/1185484138')).toContain('link do pliku');
    expect(backgroundVideoProblem('https://player.vimeo.com/video/1185484138')).toContain('link do pliku');
  });

  test('YouTube and other links are rejected', () => {
    expect(backgroundVideoProblem('https://youtu.be/dQw4w9WgXcQ')).toContain('YouTube');
    expect(backgroundVideoProblem('https://example.com/video.mp4')).toContain('Nieobsługiwany');
    expect(backgroundVideoProblem('vimeo')).toContain('https://');
  });
});
