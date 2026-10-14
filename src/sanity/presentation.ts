import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation';
import { LANGUAGES } from './languages';

// Where each document appears on the site — the Presentation tool lists
// these pages on the document and opens the right document for a URL.
export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    homePage: {
      locations: LANGUAGES.map(({ value, title }) => ({ title: `Strona główna — ${title}`, href: `/${value}/` })),
    },
    siteSettings: {
      message: 'Używane na wszystkich stronach',
      tone: 'caution',
      locations: [{ title: 'Strona główna', href: '/en/' }],
    },
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
    { route: '/:lang', type: 'homePage' },
    {
      route: '/:lang/blog/:slug',
      filter: '_type == "post" && locale == $lang && slug.current == $slug',
    },
  ]),
};
