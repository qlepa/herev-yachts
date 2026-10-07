import { defineMiddleware } from 'astro:middleware';
import { DRAFT_MODE_COOKIE, isValidDraftModeCookie } from './lib/server/cms/draftMode';

// Draft mode exists only on the CMS deployment (cms.herev.com), where
// CMS-driven pages render on demand. Prerendered pages — every page of the
// production build — have no request, so they never see drafts.
export const onRequest = defineMiddleware((context, next) => {
  context.locals.draftMode =
    !context.isPrerendered &&
    isValidDraftModeCookie(
      context.cookies.get(DRAFT_MODE_COOKIE)?.value,
      import.meta.env.SANITY_API_READ_TOKEN,
    );
  return next();
});
