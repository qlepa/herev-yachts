import type { Translations } from '../../src/lib/i18n-strings';
import {
  isGroup,
  toFieldName,
  UI_STRINGS_SPEC,
  type GroupSpec,
  type LeafSpec,
} from '../../src/sanity/uiStringsSpec';

type SpecFields = Record<string, string | LeafSpec | GroupSpec<unknown>>;

/** The spec's texts from the code translations, keyed by Sanity field names. */
export function toDocumentFields(t: Translations): Record<string, unknown> {
  return pick(UI_STRINGS_SPEC as unknown as SpecFields, t);
}

function pick(spec: SpecFields, source: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(spec)) {
    const value = (source as Record<string, unknown>)[key];
    out[toFieldName(key)] = isGroup(child) ? pick(child.fields as SpecFields, value) : value;
  }
  return out;
}
