import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation';

// Where each document appears on the site — the Presentation tool lists
// these pages on the document and opens the right document for a URL.
export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    uiStrings: defineLocations({
      select: { language: 'language' },
      resolve: (doc) => ({
        message: 'Używane na wszystkich stronach w tym języku',
        tone: 'caution',
        locations: doc?.language
          ? [
              { title: 'Strona główna', href: `/${doc.language}/` },
              { title: 'Jachty', href: `/${doc.language}/yachts/` },
              { title: 'Blog', href: `/${doc.language}/blog/` },
            ]
          : [],
      }),
    }),
    post: defineLocations({
      select: { title: 'title', slug: 'slug.current', locale: 'locale' },
      resolve: (doc) => ({
        locations:
          doc?.slug && doc.locale
            ? [
                { title: doc.title || 'Wpis', href: `/${doc.locale}/blog/${doc.slug}/` },
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
