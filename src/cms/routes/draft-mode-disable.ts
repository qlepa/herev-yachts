import type { APIRoute } from 'astro';
import { DRAFT_MODE_COOKIE } from '../../lib/server/cms/draftMode';

export const prerender = false;

export const GET: APIRoute = ({ url, cookies, redirect }) => {
  cookies.delete(DRAFT_MODE_COOKIE, { path: '/' });
  const target = url.searchParams.get('redirect') ?? '/';
  // Same-origin paths only — never an open redirect.
  return redirect(target.startsWith('/') && !target.startsWith('//') ? target : '/', 307);
};
