// Injected into every page of the CMS build only (see src/cms/integration.ts).
// Loads the Visual Editing bridge when the page was rendered with drafts,
// i.e. inside the Studio's Presentation tool.
if (document.documentElement.hasAttribute('data-draft-mode')) {
  if (import.meta.env.DEV) {
    // The bridge is React; in dev, Vite's React Refresh expects the preamble
    // that @astrojs/react injects only on pages with islands (blog has none).
    const w = window as unknown as Record<string, unknown>;
    w.$RefreshReg$ ??= () => {};
    w.$RefreshSig$ ??= () => (type: unknown) => type;
    w.__vite_plugin_react_preamble_installed__ ??= true;
  }
  import('@sanity/visual-editing').then(({ enableVisualEditing }) => {
    enableVisualEditing({
      // Pages are server-rendered HTML: any change in the Studio = reload.
      refresh: () => {
        location.reload();
        return Promise.resolve();
      },
      // Keeps the Presentation URL bar in sync with in-frame navigation.
      history: {
        subscribe: (navigate) => {
          navigate({ type: 'push', url: location.pathname + location.search });
          return () => {};
        },
        update: (update) => {
          if (update.type === 'pop') history.back();
          else location.assign(update.url);
        },
      },
    });
  });
}
