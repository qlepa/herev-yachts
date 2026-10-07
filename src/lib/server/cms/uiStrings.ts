import type { Locale } from '../../i18n';
import { getTranslations, type Translations } from '../../i18n-strings';
import {
  isGroup,
  toFieldName,
  uiStringsId,
  UI_STRINGS_SPEC,
  type GroupSpec,
  type LeafSpec,
  type UiStrings,
} from '../../../sanity/uiStringsSpec';
import { loadQuery } from './client';

type SpecFields = Record<string, string | LeafSpec | GroupSpec<unknown>>;

/**
 * Reads the spec's texts from a `uiStrings` document, restoring the site's
 * keys (`grandTourer` → `grand-tourer`). Empty texts are reported in `missing`
 * as dotted paths.
 */
export function readUiStrings(doc: unknown, missing: string[]): UiStrings {
  return pick(UI_STRINGS_SPEC as unknown as SpecFields, doc, [], missing) as UiStrings;
}

function pick(spec: SpecFields, source: unknown, path: string[], missing: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(spec)) {
    const value = (source as Record<string, unknown> | undefined)?.[toFieldName(key)];
    if (isGroup(child)) {
      out[key] = pick(child.fields as SpecFields, value, [...path, key], missing);
    } else if (typeof value === 'string' && value.trim()) {
      out[key] = value;
    } else {
      missing.push([...path, key].join('.'));
      out[key] = '';
    }
  }
  return out;
}

function mergeDeep<T>(base: T, override: unknown): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    out[key] = value && typeof value === 'object' && !Array.isArray(value) ? mergeDeep(out[key], value) : value;
  }
  return out as T;
}

async function fetchTranslations(locale: Locale, draftMode: boolean): Promise<Translations> {
  const id = uiStringsId(locale);
  const doc = await loadQuery<unknown>('*[_id == $id][0]', { id }, draftMode);
  if (!doc) throw new Error(`Sanity: document ${id} (UI texts) does not exist`);
  const missing: string[] = [];
  const ui = readUiStrings(doc, missing);
  // A draft may be incomplete — the Studio shows the empty fields; published
  // content must be complete, the build fails rather than render blanks.
  if (missing.length && !draftMode) {
    throw new Error(`Sanity: ${id} has empty texts: ${missing.join(', ')}`);
  }
  return mergeDeep(getTranslations(locale), ui);
}

const buildCache = new Map<Locale, Promise<Translations>>();

/**
 * All texts of a page: UI texts from Sanity over page content still kept in
 * code. Prerendered pages share one query per language for the whole build.
 */
export function loadTranslations(
  locale: Locale,
  page: { isPrerendered: boolean; locals: App.Locals },
): Promise<Translations> {
  const draftMode = page.locals.draftMode === true;
  if (!page.isPrerendered) return fetchTranslations(locale, draftMode);
  let cached = buildCache.get(locale);
  if (!cached) {
    cached = fetchTranslations(locale, false);
    buildCache.set(locale, cached);
  }
  return cached;
}
