/**
 * Resolves a YouTube / Vimeo page URL into a privacy-friendly embed.
 * The page renders a poster with a play button and only loads the iframe
 * on click, so no third-party script runs before the user asks for it.
 */
export interface VideoEmbed {
  provider: 'youtube' | 'vimeo';
  id: string;
  embedUrl: string;
  /** Static poster; Vimeo posters require an API call, so only YouTube has one. */
  posterUrl?: string;
}

export function parseVideoUrl(url: string): VideoEmbed | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '');

  if (host === 'youtu.be' || host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id =
      host === 'youtu.be'
        ? u.pathname.slice(1)
        : (u.searchParams.get('v') ?? /\/(?:embed|shorts)\/([^/?]+)/.exec(u.pathname)?.[1] ?? '');
    if (!/^[\w-]{6,}$/.test(id)) return null;
    return {
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      posterUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = /(\d{6,})/.exec(u.pathname)?.[1];
    if (!id) return null;
    return {
      provider: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
    };
  }

  return null;
}
