import { describe, expect, it } from 'vitest';
import { staticPathProps } from './staticPaths';

const paths = () => [
  { params: { lang: 'en', country: 'pl' }, props: { countryCode: 'PL' } },
  { params: { lang: 'en', country: 'es' }, props: { countryCode: 'ES' } },
  { params: { lang: 'pl' } },
];

const onDemand = (params: Record<string, string | undefined>) => ({ isPrerendered: false, params, props: {} });

describe('staticPathProps', () => {
  it('returns the props of the matching path when rendered on demand', async () => {
    expect(await staticPathProps(onDemand({ lang: 'en', country: 'es' }), paths)).toEqual({ countryCode: 'ES' });
  });

  it('returns empty props for a matching path without props', async () => {
    expect(await staticPathProps(onDemand({ lang: 'pl' }), paths)).toEqual({});
  });

  it('returns null for a URL the production build does not have', async () => {
    expect(await staticPathProps(onDemand({ lang: 'en', country: 'xx' }), paths)).toBeNull();
    expect(await staticPathProps(onDemand({ lang: 'de' }), paths)).toBeNull();
  });

  it('passes Astro props through when prerendered', async () => {
    const page = { isPrerendered: true, params: { lang: 'en' }, props: { countryCode: 'PL' } };
    expect(await staticPathProps(page, () => [])).toEqual({ countryCode: 'PL' });
  });
});
