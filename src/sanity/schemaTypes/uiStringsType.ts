import { defineField, defineType, type FieldDefinition } from 'sanity';
import { LANGUAGES } from '../languages';
import {
  isGroup,
  leaf,
  PLACEHOLDERS,
  toFieldName,
  UI_STRINGS_SPEC,
  UI_STRINGS_TABS,
  type GroupSpec,
  type LeafSpec,
} from '../uiStringsSpec';

function leafField(name: string, spec: LeafSpec): FieldDefinition {
  const placeholders = spec.placeholders ?? [];
  const hint = placeholders.map((p) => `${p} = ${PLACEHOLDERS[p]}`).join(', ');
  return defineField({
    name,
    title: spec.title,
    description: [spec.description, hint && `Zostaw w tekście: ${hint} — strona wstawi tu właściwą wartość.`]
      .filter(Boolean)
      .join(' '),
    type: spec.rows ? 'text' : 'string',
    ...(spec.rows && { rows: spec.rows }),
    validation: (Rule) =>
      Rule.custom((value: string | undefined) => {
        if (!value?.trim()) return 'Wpisz tekst — to pole jest widoczne na stronie';
        const missing = placeholders.filter((p) => !value.includes(p));
        return missing.length ? `Brakuje ${missing.join(', ')} — bez tego strona nie wstawi wartości` : true;
      }),
  });
}

function fieldsFor(spec: GroupSpec<unknown>['fields']): FieldDefinition[] {
  return Object.entries(spec as Record<string, string | LeafSpec | GroupSpec<unknown>>).map(([key, child]) =>
    isGroup(child)
      ? defineField({
          name: toFieldName(key),
          title: child.title,
          description: child.description,
          type: 'object',
          options: { collapsible: true, collapsed: false },
          fields: fieldsFor(child.fields),
        })
      : leafField(toFieldName(key), leaf(child)),
  );
}

export const uiStringsType = defineType({
  name: 'uiStrings',
  title: 'Teksty interfejsu',
  type: 'document',
  groups: UI_STRINGS_TABS.map((tab, i) => ({ ...tab, default: i === 0 })),
  fields: [
    defineField({
      name: 'language',
      title: 'Język',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    ...Object.entries(UI_STRINGS_SPEC).map(([key, group]) =>
      defineField({
        name: toFieldName(key),
        title: group.title,
        description: group.description,
        type: 'object',
        group: group.tab,
        options: { collapsible: true, collapsed: false },
        fields: fieldsFor(group.fields),
      }),
    ),
  ],
  preview: {
    select: { language: 'language' },
    prepare({ language }) {
      const name = LANGUAGES.find((l) => l.value === language)?.title ?? language;
      return { title: `Teksty interfejsu — ${name}` };
    },
  },
});
