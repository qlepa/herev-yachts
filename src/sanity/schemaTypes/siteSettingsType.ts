import { defineArrayMember, defineField, defineType } from 'sanity';
import { recommendMinWidth } from './image';

/** Single document with the fixed ID `siteSettings`; the same for every language. */
export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Kontakt i SEO',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Kontakt', default: true },
    { name: 'seo', title: 'SEO i udostępnianie' },
  ],
  fields: [
    defineField({
      name: 'email',
      title: 'E-mail kontaktowy',
      description: 'Pokazywany pod formularzami zapytań jako alternatywa dla formularza.',
      type: 'string',
      group: 'contact',
      validation: (Rule) => [
        Rule.required().error('Wpisz adres e-mail'),
        Rule.email().error('Nieprawidłowy adres e-mail'),
      ],
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      description:
        'Z numerem kierunkowym, np. +48 600 000 000. Gdy wpisany, pod formularzem pojawia się „lub zadzwoń” z tym numerem. Puste = bez telefonu.',
      type: 'string',
      group: 'contact',
      validation: (Rule) =>
        Rule.regex(/^\+[0-9 ]{7,20}$/).error('Zacznij od + i numeru kierunkowego; tylko cyfry i spacje'),
    }),
    defineField({
      name: 'titleSuffix',
      title: 'Dopisek do tytułu strony',
      description:
        'Dodawany na końcu tytułu każdej strony (karta przeglądarki, Google), np. „Galeon 500 Fly — Herev”. Nie dotyczy stron z własnym tytułem w zakładce SEO.',
      type: 'string',
      group: 'seo',
      validation: (Rule) => Rule.required().error('Wpisz dopisek, np. „— Herev”'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Obrazek do udostępnień',
      description:
        'Pokazywany, gdy ktoś udostępnia link do strony (Facebook, LinkedIn, WhatsApp…), jeśli strona nie ma własnego. Najlepiej 1200 × 630 px.',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      validation: recommendMinWidth(1200),
    }),
    defineField({
      name: 'socialProfiles',
      title: 'Profile w mediach społecznościowych',
      description: 'Pełne adresy profili (LinkedIn, Instagram, Facebook…). Google łączy je z firmą Herev.',
      type: 'array',
      group: 'seo',
      of: [
        defineArrayMember({
          type: 'url',
          validation: (Rule) => Rule.uri({ scheme: ['https'] }).error('Wklej pełny adres zaczynający się od https://'),
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Kontakt i SEO' }),
  },
});
