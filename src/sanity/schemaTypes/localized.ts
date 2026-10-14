import { defineField, defineType, type Rule } from 'sanity';
import { LANGUAGES } from '../languages';
import { ALT_FIELD_DESCRIPTION, recommendMinWidth } from './image';

/** One language version of a multilingual field (sanity-plugin-internationalized-array). */
interface LocalizedItem {
  _key: string;
  language?: string;
  value?: unknown;
}

const isFilled = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim() !== '';
  if (value && typeof value === 'object') {
    return Object.values(value).some((v) => typeof v === 'string' && v.trim() !== '');
  }
  return false;
};

/**
 * Every site language must be filled in — a missing language would leave
 * the page with an empty heading (the build refuses to publish it).
 */
export function requireAllLanguages(rule: Rule) {
  return rule.custom((value: LocalizedItem[] | undefined) => {
    const missing = LANGUAGES.filter(
      ({ value: language }) => !value?.some((item) => item.language === language && isFilled(item.value)),
    );
    return missing.length ? `Uzupełnij wszystkie języki — brakuje: ${missing.map((l) => l.title).join(', ')}` : true;
  });
}

/** Text field with a version per language. */
export function localizedField(props: {
  name: string;
  title: string;
  description?: string;
  /** Multi-line input for paragraphs. */
  multiline?: boolean;
  group?: string;
}) {
  return defineField({
    name: props.name,
    title: props.title,
    description: props.description,
    group: props.group,
    type: props.multiline ? 'internationalizedArrayText' : 'internationalizedArrayString',
    validation: requireAllLanguages,
  });
}

/** Page image: entered once, alt text per language. */
export const pageImageType = defineType({
  name: 'pageImage',
  title: 'Zdjęcie',
  type: 'image',
  options: { hotspot: true },
  description: 'Kliknij ikonę ołówka na zdjęciu, aby wskazać najważniejszy punkt (nie zostanie obcięty) i przyciąć kadr.',
  fields: [
    defineField({
      name: 'alt',
      title: 'Opis zdjęcia (alt)',
      description: ALT_FIELD_DESCRIPTION,
      type: 'internationalizedArrayString',
      validation: requireAllLanguages,
    }),
  ],
  validation: (rule) => [rule.required().error('Wgraj zdjęcie'), recommendMinWidth(1200)(rule)],
});
