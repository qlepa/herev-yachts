import { useFormValue, type ObjectInputProps } from 'sanity';

interface DocumentForPreview {
  _type?: string;
  title?: string;
  excerpt?: string;
  locale?: string;
  slug?: { current?: string };
}

/** SEO fields followed by an approximation of the Google search result. */
export function SeoInput(props: ObjectInputProps) {
  const doc = useFormValue([]) as DocumentForPreview | undefined;
  const seo = (props.value ?? {}) as { title?: string; description?: string };

  // Same fallbacks as the page (e.g. src/pages/[lang]/blog/[slug].astro).
  const title = seo.title || (doc?.title ? `${doc.title} — Herev` : 'Tytuł strony');
  const description = seo.description || doc?.excerpt || '';
  const path = doc?._type === 'post' ? [doc.locale ?? 'en', 'blog', doc.slug?.current ?? '…'] : [];
  const url = ['herev.com', ...path].join(' › ');

  return (
    <div>
      {props.renderDefault(props)}
      <div style={{ marginTop: 20, fontSize: 13, opacity: 0.7 }}>Podgląd w Google (w przybliżeniu)</div>
      <div
        style={{
          marginTop: 8,
          padding: 16,
          maxWidth: 600,
          borderRadius: 8,
          background: '#fff',
          border: '1px solid #dadce0',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ fontSize: 14, color: '#202124' }}>{url}</div>
        <div
          style={{
            marginTop: 4,
            fontSize: 20,
            lineHeight: 1.3,
            color: '#1a0dab',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 14,
            lineHeight: 1.58,
            color: '#4d5156',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description || 'Brak opisu — Google sam wybierze fragment tekstu ze strony.'}
        </div>
      </div>
    </div>
  );
}
