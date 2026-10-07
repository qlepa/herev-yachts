import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation';

// Where each document appears on the site — the Presentation tool lists
// these pages on the document and opens the right document for a URL.
export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    post: defineLocations({
      select: { title: 'title', slug: 'slug.current', locale: 'locale' },
      resolve: (doc) => ({
        locations:
          doc?.slug && doc.locale
            ? [
                { title: doc.title || 'Post', href: `/${doc.locale}/blog/${doc.slug}/` },
                { title: 'Blog', href: `/${doc.locale}/blog/` },
              ]
            : [],
      }),
    }),
  },
  mainDocuments: defineDocuments([
    {
      route: '/:lang/blog/:slug',
      filter: '_type == "post" && locale == $lang && slug.current == $slug',
    },
  ]),
};
