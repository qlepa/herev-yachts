import { defineArrayMember, defineField, defineType } from 'sanity';

const POLISH_DIACRITICS: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (char) => POLISH_DIACRITICS[char] ?? char)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 96);
}

export const postType = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) => slugify(input),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'locale',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Polski', value: 'pl' },
          { title: 'Español', value: 'es' },
          { title: 'Italiano', value: 'it' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'translationOf',
      title: 'Translation of',
      description:
        'The English version of this article — links them for hreflang. Leave empty for the English version itself.',
      type: 'reference',
      to: [{ type: 'post' }],
      options: {
        filter: 'locale == "en"',
      },
      hidden: ({ parent }) => (parent as { locale?: string } | undefined)?.locale === 'en',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const locale = (context.parent as { locale?: string } | undefined)?.locale;
          if (locale && locale !== 'en' && !value) {
            return 'Required for non-English posts — link to the English version';
          }
          return true;
        }),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: 'Shown on the blog listing cards and used as the meta description fallback. Max 200 characters.',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      description: 'Free text, e.g. "BUYING GUIDE".',
      type: 'string',
    }),
    defineField({
      name: 'draft',
      title: 'Draft',
      description: 'Draft posts are excluded from the site build.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'image',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) =>
            Rule.custom((alt, context) => {
              const image = context.parent as { asset?: unknown } | undefined;
              if (image?.asset && !alt) {
                return 'Alt text is required when a cover image is set';
              }
              return true;
            }),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', locale: 'locale', media: 'image' },
    prepare({ title, locale, media }) {
      return { title, subtitle: locale, media };
    },
  },
});
