import { defineArrayMember, defineField, defineType } from 'sanity';
import { backgroundVideoProblem } from '../../lib/video';
import { LANGUAGES } from '../languages';
import { localizedField } from './localized';

const image = (description?: string) =>
  defineField({ name: 'image', title: 'Zdjęcie', type: 'pageImage', description });

/** A number with a caption, e.g. "17 / YEARS". */
const stat = defineArrayMember({
  type: 'object',
  name: 'stat',
  title: 'Liczba',
  fields: [
    defineField({
      name: 'value',
      title: 'Liczba',
      description: 'Taka sama we wszystkich językach, np. „17” albo „30+”.',
      type: 'string',
      validation: (rule) => rule.required().error('Wpisz liczbę'),
    }),
    localizedField({ name: 'label', title: 'Podpis' }),
  ],
  preview: {
    select: { value: 'value', label: 'label.0.value' },
    prepare: ({ value, label }) => ({ title: `${value ?? ''} ${label ?? ''}`.trim() }),
  },
});

const advisoryBlock = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      localizedField({ name: 'heading', title: 'Nagłówek', multiline: true }),
      defineField({
        name: 'bullets',
        title: 'Punkty',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'bullet',
            title: 'Punkt',
            fields: [
              localizedField({ name: 'lead', title: 'Początek (pogrubiony)' }),
              localizedField({ name: 'rest', title: 'Dalsza część', multiline: true }),
            ],
            preview: {
              select: { lead: 'lead.0.value', rest: 'rest.0.value' },
              prepare: ({ lead, rest }) => ({ title: lead, subtitle: rest }),
            },
          }),
        ],
        validation: (rule) => rule.min(1).error('Dodaj co najmniej jeden punkt'),
      }),
      image(),
    ],
  });

/** Singleton with the fixed ID `homePage`; sections in display order. */
export const homePageType = defineType({
  name: 'homePage',
  title: 'Strona główna',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Na górze', default: true },
    { name: 'intro', title: 'Wprowadzenie' },
    { name: 'advisory', title: 'Doradztwo' },
    { name: 'guide', title: 'Poradnik' },
    { name: 'shipyards', title: 'Stocznie' },
    { name: 'statement', title: 'Hasło' },
    { name: 'network', title: 'Sieć dealerska' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Na górze strony',
      type: 'object',
      group: 'hero',
      fields: [
        localizedField({ name: 'heading', title: 'Nagłówek' }),
        localizedField({ name: 'subtext', title: 'Tekst pod nagłówkiem', multiline: true }),
        localizedField({ name: 'cta1', title: 'Przycisk 1 (przewija do formularza)' }),
        localizedField({ name: 'cta2', title: 'Przycisk 2 (lista jachtów)' }),
        defineField({
          name: 'video',
          title: 'Film w tle',
          description:
            'Link do pliku z Vimeo (nie do strony filmu). Film gra bez dźwięku, w pętli. Puste = samo zdjęcie.',
          type: 'url',
          validation: (rule) =>
            rule.custom((url: string | undefined) => (url ? (backgroundVideoProblem(url) ?? true) : true)),
        }),
        image(
          'Widoczne od razu, zanim film się wczyta (i zamiast filmu, gdy go nie ma). Najlepiej kadr z początku filmu, co najmniej 1920 px szerokości.',
        ),
      ],
    }),
    defineField({
      name: 'intro',
      title: 'Wprowadzenie',
      type: 'object',
      group: 'intro',
      fields: [
        localizedField({ name: 'eyebrow', title: 'Nadtytuł' }),
        localizedField({ name: 'heading', title: 'Nagłówek', multiline: true }),
        localizedField({ name: 'body', title: 'Tekst', multiline: true }),
        defineField({
          name: 'stats',
          title: 'Liczby',
          type: 'array',
          of: [stat],
          validation: (rule) => rule.length(3).error('Sekcja ma miejsce na dokładnie 3 liczby'),
        }),
      ],
    }),
    defineField({
      name: 'advisory',
      title: 'Doradztwo',
      type: 'object',
      group: 'advisory',
      fields: [advisoryBlock('advise', 'Blok 1: doradzamy'), advisoryBlock('represent', 'Blok 2: reprezentujemy')],
    }),
    defineField({
      name: 'guide',
      title: 'Poradnik dla kupujących',
      type: 'object',
      group: 'guide',
      fields: [
        localizedField({ name: 'heading', title: 'Nagłówek' }),
        localizedField({ name: 'body', title: 'Tekst', multiline: true }),
        localizedField({ name: 'emailPlaceholder', title: 'Podpowiedź w polu e-mail' }),
        localizedField({ name: 'cta', title: 'Przycisk' }),
      ],
    }),
    defineField({
      name: 'shipyards',
      title: 'Stocznie',
      description: 'Kafelki marek pod tekstem pochodzą z marek.',
      type: 'object',
      group: 'shipyards',
      fields: [
        localizedField({ name: 'eyebrow', title: 'Nadtytuł' }),
        localizedField({ name: 'heading', title: 'Nagłówek' }),
        localizedField({ name: 'body', title: 'Tekst', multiline: true }),
        image(),
      ],
    }),
    defineField({
      name: 'statement',
      title: 'Hasło',
      type: 'object',
      group: 'statement',
      fields: [
        localizedField({ name: 'headingLine1', title: 'Nagłówek: 1. linia' }),
        localizedField({ name: 'headingLine2', title: 'Nagłówek: 2. linia' }),
        localizedField({ name: 'body', title: 'Tekst', multiline: true }),
      ],
    }),
    defineField({
      name: 'network',
      title: 'Sieć dealerska',
      type: 'object',
      group: 'network',
      fields: [
        localizedField({ name: 'eyebrow', title: 'Nadtytuł' }),
        localizedField({ name: 'heading', title: 'Nagłówek' }),
        localizedField({ name: 'body', title: 'Tekst', multiline: true }),
        localizedField({
          name: 'countriesLabel',
          title: 'Podpis liczby krajów',
          description: 'Liczba krajów liczy się sama z listy lokalizacji dealerów.',
        }),
        defineField({
          name: 'stats',
          title: 'Pozostałe liczby',
          type: 'array',
          of: [stat],
          validation: (rule) => rule.length(2).error('Sekcja ma miejsce na dokładnie 2 liczby'),
        }),
        localizedField({ name: 'linkLabel', title: 'Link do strony sieci' }),
        image(),
        localizedField({ name: 'imageCaption', title: 'Podpis na zdjęciu' }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      description: 'Tytuł i opis strony głównej w Google, w każdym języku.',
      type: 'internationalizedArraySeo',
      group: 'seo',
      validation: (rule) =>
        rule.custom((value: Array<{ language?: string; value?: { title?: string; description?: string } }> | undefined) => {
          const missing = LANGUAGES.filter(({ value: language }) => {
            const seo = value?.find((item) => item.language === language)?.value;
            return !seo?.title?.trim() || !seo.description?.trim();
          });
          return missing.length
            ? `Wpisz tytuł i opis we wszystkich językach — brakuje: ${missing.map((l) => l.title).join(', ')}`
            : true;
        }),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Strona główna' }),
  },
});
