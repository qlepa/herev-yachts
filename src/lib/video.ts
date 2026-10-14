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

/**
 * Background video (autoplay, muted loop) needs a direct link to the video
 * file, which Vimeo gives on paid plans. Returns what is wrong with `url`
 * in words an editor can act on (Polish — shown in the Studio), or null.
 */
export function backgroundVideoProblem(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return 'To nie jest link — wklej pełny adres zaczynający się od https://';
  }
  const host = u.hostname.replace(/^www\./, '');
  if (host === 'player.vimeo.com' && /^\/(progressive_redirect|external)\//.test(u.pathname)) return null;
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    return 'To link do strony filmu, a potrzebny jest link do pliku. W Vimeo otwórz film → zakładka „Distribution” → „Video file links” → skopiuj link do wersji 1080p.';
  }
  if (parseVideoUrl(url)) {
    return 'YouTube nie udostępnia linków do plików — wgraj film na Vimeo i wklej link do pliku.';
  }
  return 'Nieobsługiwany link — wklej link do pliku z Vimeo (player.vimeo.com/progressive_redirect/… lub player.vimeo.com/external/…).';
}
