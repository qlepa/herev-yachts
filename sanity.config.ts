import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { plPLLocale } from '@sanity/locale-pl-pl';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';
import { resolve } from './src/sanity/presentation';
import { LANGUAGES } from './src/sanity/languages';

const SINGLETON_TYPES = new Set(['siteSettings', 'uiStrings', 'notificationRecipients']);

export default defineConfig({
  name: 'default',
  title: 'Herev Yachts',

  projectId: '9djarxf8',
  dataset: 'production',
  basePath: '/admin',

  plugins: [
    structureTool({ title: 'Treść', structure }),
    presentationTool({
      title: 'Podgląd',
      resolve,
      previewUrl: {
        initial: '/en/blog/',
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
    }),
    visionTool(),
    plPLLocale(),
  ],

  schema: {
    types: schemaTypes,
    // A new post is created in the language it is added from, dated today.
    templates: (prev) => [
      ...prev.filter((template) => template.schemaType !== 'post'),
      ...LANGUAGES.map(({ value, title }) => ({
        id: `post-${value}`,
        title: `Wpis na blogu — ${title}`,
        schemaType: 'post',
        value: () => ({ locale: value, publishedAt: new Date().toISOString().slice(0, 10) }),
      })),
    ],
  },

  document: {
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType)
        ? input.filter(({ action }) => !['duplicate', 'delete'].includes(action ?? ''))
        : input,
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter((item) => !SINGLETON_TYPES.has(item.templateId));
      }
      return prev;
    },
  },
});
