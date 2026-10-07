import { defineField, defineType } from 'sanity';
import { withCharCount } from '../components/CharCountInput';
import { SeoInput } from '../components/SeoInput';

export const seoType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  components: { input: SeoInput },
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł w Google',
      description: 'Niebieski tytuł w wynikach wyszukiwania i na karcie przeglądarki. Puste = tytuł strony z dopiskiem „— Herev”.',
      type: 'string',
      components: { input: withCharCount(60) },
      validation: (Rule) => Rule.max(60).error('Maksymalnie 60 znaków — dłuższy tytuł Google utnie'),
    }),
    defineField({
      name: 'description',
      title: 'Opis w Google',
      description: 'Szary tekst pod tytułem w wynikach wyszukiwania. Jedno, dwa zdania zachęcające do kliknięcia.',
      type: 'text',
      rows: 2,
      components: { input: withCharCount(160) },
      validation: (Rule) => Rule.max(160).error('Maksymalnie 160 znaków — dłuższy opis Google utnie'),
    }),
  ],
});
