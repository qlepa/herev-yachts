import { describe, expect, it, vi } from 'vitest';
import { LOCALES } from '../../src/lib/i18n';
import { getTranslations } from '../../src/lib/i18n-strings';
import { readUiStrings } from '../../src/lib/server/cms/uiStrings';
import {
  isGroup,
  leaf,
  PLACEHOLDERS,
  UI_STRINGS_SPEC,
  type GroupSpec,
  type LeafSpec,
} from '../../src/sanity/uiStringsSpec';
import { toDocumentFields } from './convert';

vi.mock('../../src/lib/server/cms/client', () => ({ client: {}, loadQuery: vi.fn() }));

type SpecFields = Record<string, string | LeafSpec | GroupSpec<unknown>>;

/** Every text of the spec with its declared placeholders. */
function leaves(spec: SpecFields, source: unknown, path: string[] = []): Array<{ path: string; value: unknown; spec: LeafSpec }> {
  return Object.entries(spec).flatMap(([key, child]) => {
    const value = (source as Record<string, unknown>)[key];
    return isGroup(child)
      ? leaves(child.fields as SpecFields, value, [...path, key])
      : [{ path: [...path, key].join('.'), value, spec: leaf(child) }];
  });
}

describe.each(LOCALES)('UI texts migration — %s', (locale) => {
  const t = getTranslations(locale);

  it('round-trips through the Sanity document shape with every text filled', () => {
    const missing: string[] = [];
    const read = readUiStrings(toDocumentFields(t), missing);
    expect(missing).toEqual([]);
    for (const { path } of leaves(UI_STRINGS_SPEC as unknown as SpecFields, t)) {
      const get = (obj: unknown) => path.split('.').reduce((o, k) => (o as Record<string, unknown>)[k], obj);
      expect(get(read), path).toBe(get(t));
    }
  });

  it('declares exactly the placeholders each text uses', () => {
    for (const { path, value, spec } of leaves(UI_STRINGS_SPEC as unknown as SpecFields, t)) {
      const used = (String(value).match(/\{[a-z]+\}/g) ?? []).sort();
      expect(used, path).toEqual([...(spec.placeholders ?? [])].sort());
      for (const p of used) expect(Object.keys(PLACEHOLDERS), path).toContain(p);
    }
  });
});
