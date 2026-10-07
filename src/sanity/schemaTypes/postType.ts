import { defineArrayMember, defineField, defineType } from 'sanity';
import { withCharCount } from '../components/CharCountInput';
import { LANGUAGES } from '../languages';
import { ALT_FIELD_DESCRIPTION, ALT_REQUIRED, recommendMinWidth } from './image';

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

/** Blog categories (carried over from the yachts24.eu blog). */
export const POST_CATEGORIES = [
  'Yachts',
  'Yacht broker',
  'Yacht registration',
  'Sailing news',
  'Cruising',
  'Poland',
] as const;

export const postType = defineType({
  name: 'post',
  title: 'Wpis na blogu',
  type: 'document',
  groups: [
    { name: 'content', title: 'Treść', default: true },
    { name: 'details', title: 'Szczegóły' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().error('Wpisz tytuł'),
    }),
    defineField({
      name: 'slug',
      title: 'Adres strony',
      description:
        'Końcówka adresu: /en/blog/adres-strony/. Kliknij „Generate”, aby utworzyć go z tytułu. Nie zmieniaj po publikacji — stare linki przestaną działać.',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) => slugify(input),
      },
      validation: (Rule) => Rule.required().error('Uzupełnij adres strony (przycisk „Generate”)'),
    }),
    defineField({
      name: 'excerpt',
      title: 'Zajawka',
      description:
        'Krótki opis na kafelku na liście bloga. Jest też opisem w Google, jeśli w zakładce SEO nie wpiszesz innego.',
      type: 'text',
      rows: 3,
      group: 'content',
      components: { input: withCharCount(200) },
      validation: (Rule) => [
        Rule.required().error('Wpisz zajawkę'),
        Rule.max(200).error('Maksymalnie 200 znaków'),
      ],
    }),
    defineField({
      name: 'image',
      title: 'Zdjęcie główne',
      description: 'Na liście bloga i na górze wpisu. Najlepiej poziome, co najmniej 1200 px szerokości.',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      validation: recommendMinWidth(1200),
      fields: [
        defineField({
          name: 'alt',
          title: 'Opis zdjęcia (alt)',
          description: ALT_FIELD_DESCRIPTION,
          type: 'string',
          validation: (Rule) =>
            Rule.custom((alt, context) => {
              const image = context.parent as { asset?: unknown } | undefined;
              return image?.asset && !alt ? ALT_REQUIRED : true;
            }),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Treść',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Akapit', value: 'normal' },
            { title: 'Nagłówek', value: 'h2' },
            { title: 'Podtytuł', value: 'h3' },
            { title: 'Cytat', value: 'blockquote' },
          ],
          lists: [
            { title: 'Wypunktowanie', value: 'bullet' },
            { title: 'Numerowanie', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Pogrubienie', value: 'strong' },
              { title: 'Kursywa', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'Adres',
                    description: 'Pełny adres (https://…) albo strona w tym serwisie, np. /en/blog/…/',
                    validation: (Rule) =>
                      Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }).error(
                        'Nieprawidłowy adres — zacznij od https://, / albo mailto:',
                      ),
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          title: 'Zdjęcie',
          options: { hotspot: true },
          validation: recommendMinWidth(800),
          fields: [
            defineField({
              name: 'alt',
              title: 'Opis zdjęcia (alt)',
              description: ALT_FIELD_DESCRIPTION,
              type: 'string',
              validation: (Rule) => Rule.required().error(ALT_REQUIRED),
            }),
            defineField({
              name: 'caption',
              title: 'Podpis',
              description: 'Opcjonalny, widoczny pod zdjęciem.',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'locale',
      title: 'Język',
      type: 'string',
      group: 'details',
      options: { list: LANGUAGES, layout: 'radio' },
      validation: (Rule) => Rule.required().error('Wybierz język'),
    }),
    defineField({
      name: 'translationOf',
      title: 'Wersja angielska',
      description:
        'Ten sam artykuł po angielsku — łączy wersje językowe, żeby Google pokazywał właściwy język. Puste tylko dla wpisu po angielsku.',
      type: 'reference',
      group: 'details',
      to: [{ type: 'post' }],
      options: {
        filter: 'locale == "en"',
      },
      hidden: ({ parent }) => (parent as { locale?: string } | undefined)?.locale === 'en',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const locale = (context.parent as { locale?: string } | undefined)?.locale;
          if (locale && locale !== 'en' && !value) {
            return 'Wskaż angielską wersję tego artykułu';
          }
          return true;
        }),
    }),
    defineField({
      name: 'author',
      title: 'Autor',
      description: 'Widoczny pod tytułem. Puste = bez autora.',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data publikacji',
      description: 'Widoczna pod tytułem; decyduje o kolejności na liście bloga (najnowsze pierwsze).',
      type: 'date',
      group: 'details',
      validation: (Rule) => Rule.required().error('Wybierz datę publikacji'),
    }),
    defineField({
      name: 'modifiedAt',
      title: 'Data aktualizacji',
      description: 'Wpisz, gdy treść artykułu istotnie się zmieniła. Puste = data ostatniego zapisu.',
      type: 'date',
      group: 'details',
    }),
    defineField({
      name: 'categories',
      title: 'Kategorie',
      description: 'Pierwsza wybrana jest widoczna na liście bloga i nad tytułem.',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: [...POST_CATEGORIES] },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      description: 'Jak wpis wygląda w wynikach Google. Puste pola = tytuł i zajawka wpisu.',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', locale: 'locale', publishedAt: 'publishedAt', media: 'image' },
    prepare({ title, locale, publishedAt, media }) {
      return { title, subtitle: [locale?.toUpperCase(), publishedAt].filter(Boolean).join(' · '), media };
    },
  },
});
