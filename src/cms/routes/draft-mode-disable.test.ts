import { describe, expect, test, vi } from 'vitest';
import type { APIContext } from 'astro';
import { GET } from './draft-mode-disable';

function run(query: string) {
  const cookies = { delete: vi.fn() };
  const redirect = vi.fn((to: string, status: number) => new Response(null, { status, headers: { Location: to } }));
  const res = GET({ url: new URL(`https://cms.herev.com/api/draft-mode/disable${query}`), cookies, redirect } as unknown as APIContext) as Response;
  return { res, cookies, redirect };
}

describe('draft-mode disable', () => {
  test('clears the cookie site-wide and goes back to the page', () => {
    const { res, cookies } = run('?redirect=/pl/blog/');
    expect(cookies.delete).toHaveBeenCalledWith('herev-draft-mode', { path: '/' });
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe('/pl/blog/');
  });

  test.each(['//evil.com', 'https://evil.com/', 'javascript:alert(1)'])('never an open redirect: %s → /', (target) => {
    const { res } = run(`?redirect=${encodeURIComponent(target)}`);
    expect(res.headers.get('Location')).toBe('/');
  });

  test('no redirect param → /', () => {
    expect(run('').res.headers.get('Location')).toBe('/');
  });
});
