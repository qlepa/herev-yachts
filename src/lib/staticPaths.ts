interface StaticPath {
  params: Record<string, string | number | undefined>;
  props?: Record<string, unknown>;
}

interface PageContext<P> {
  isPrerendered: boolean;
  params: Record<string, string | undefined>;
  props: P;
}

/**
 * On the CMS deployment pages render on demand and Astro skips
 * `getStaticPaths`, so the page checks its URL against the same list the
 * production build uses. Returns that path's props, or null when the URL
 * would not exist in production (→ 404). Prerendered pages get their props
 * from Astro as usual.
 */
export async function staticPathProps<P>(
  page: PageContext<P>,
  getStaticPaths: () => StaticPath[] | Promise<StaticPath[]>,
): Promise<P | null> {
  if (page.isPrerendered) return page.props;
  const paths = await getStaticPaths();
  const match = paths.find(({ params }) =>
    Object.entries(params).every(([key, value]) => String(value) === page.params[key]),
  );
  return match ? ((match.props ?? {}) as P) : null;
}
