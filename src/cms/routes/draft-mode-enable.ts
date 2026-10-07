import type { APIRoute } from 'astro';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { client } from '../../lib/server/cms/client';
import { DRAFT_MODE_COOKIE, draftModeToken } from '../../lib/server/cms/draftMode';

export const prerender = false;

// Called by the Studio's Presentation tool with a one-time secret it has
// just stored in the dataset. Only a valid secret switches drafts on.
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(client, request.url);
  if (!isValid) return new Response('Invalid secret', { status: 401 });

  cookies.set(DRAFT_MODE_COOKIE, draftModeToken(import.meta.env.SANITY_API_READ_TOKEN), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
  });
  return redirect(redirectTo, 307);
};
