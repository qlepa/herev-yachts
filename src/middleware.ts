import { defineMiddleware } from 'astro:middleware';
import { DRAFT_MODE_COOKIE, isValidDraftModeCookie } from './lib/server/cms/draftMode';
import { loadSiteSettings } from './lib/server/cms/settings';

// Draft mode exists only on the CMS deployment (cms.herev.com), where
// CMS-driven pages render on demand. Prerendered pages — every page of the
// production build — have no request, so they never see drafts.
export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.draftMode =
    !context.isPrerendered &&
    isValidDraftModeCookie(
      context.cookies.get(DRAFT_MODE_COOKIE)?.value,
      import.meta.env.SANITY_API_READ_TOKEN,
    );
  // Site pages (not the Studio or API routes) read the settings — the
  // layout uses them, so they are loaded once here for every page.
  if (context.routePattern.startsWith('/[lang]')) {
    context.locals.siteSettings = await loadSiteSettings({
      isPrerendered: context.isPrerendered,
      draftMode: context.locals.draftMode,
    });
  }
  return next();
});
