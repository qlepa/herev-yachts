import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

const SINGLETON_TYPES = new Set(['notificationRecipients']);

export default defineConfig({
  name: 'default',
  title: 'Herev Yachts',

  projectId: '9djarxf8',
  dataset: 'production',
  basePath: '/admin',

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
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
