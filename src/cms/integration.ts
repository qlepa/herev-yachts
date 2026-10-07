import type { AstroIntegration } from 'astro';

/**
 * Every localized page shows CMS content (at least the UI texts), so on the
 * CMS deployment they all render per request — drafts show up without a
 * rebuild. Each page validates its own URL (`staticPathProps`).
 */
const isCmsPage = (component: string) => component.startsWith('src/pages/[lang]/');

/**
 * CMS mode (`SANITY_PREVIEW=true`, the cms.herev.com deployment): adds the
 * Studio, the draft-mode endpoints, the Visual Editing bridge, and renders
 * CMS-driven pages on demand so drafts show up without a rebuild.
 * Without the flag this integration is not registered, so the production
 * build contains none of it.
 */
export function cmsPreview(): AstroIntegration {
  return {
    name: 'herev:cms-preview',
    hooks: {
      'astro:config:setup': ({ injectRoute, injectScript, updateConfig }) => {
        // Pre-bundle the lazily imported bridge so the dev server does not
        // discover it mid-session and invalidate loaded modules (504).
        updateConfig({ vite: { optimizeDeps: { include: ['@sanity/visual-editing'] } } });
        injectRoute({ pattern: '/admin/[...path]', entrypoint: new URL('./routes/studio.astro', import.meta.url) });
        injectRoute({ pattern: '/api/draft-mode/enable', entrypoint: new URL('./routes/draft-mode-enable.ts', import.meta.url) });
        injectRoute({ pattern: '/api/draft-mode/disable', entrypoint: new URL('./routes/draft-mode-disable.ts', import.meta.url) });
        injectScript('page', `import '/src/cms/visual-editing.ts';`);
      },
      'astro:route:setup': ({ route }) => {
        if (isCmsPage(route.component)) route.prerender = false;
      },
    },
  };
}
