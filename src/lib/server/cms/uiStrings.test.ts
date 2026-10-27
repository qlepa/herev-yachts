import { describe, expect, test, vi } from 'vitest';
import { loadTranslations } from './uiStrings';
import { loadQuery } from './client';
import { getTranslations } from '../../i18n-strings';
import { toDocumentFields } from '../../../../scripts/ui-strings/convert';

vi.mock('./client', () => ({ client: {}, loadQuery: vi.fn() }));
const mockedLoadQuery = vi.mocked(loadQuery);

/** A complete `uiStrings` document, as the migration script writes it. */
const completeDoc = (lang: 'en' | 'pl' | 'es' | 'it') => toDocumentFields(getTranslations(lang));

const onDemand = (draftMode: boolean) => ({ isPrerendered: false, locals: { draftMode } as App.Locals });

describe('loadTranslations', () => {
  test('published: CMS texts override the spec keys, code keeps everything outside the spec', async () => {
    const doc = completeDoc('pl') as Record<string, Record<string, string>>;
    doc.nav = { ...doc.nav, blog: 'Dziennik pokładowy' };
    mockedLoadQuery.mockResolvedValueOnce(doc);

    const t = await loadTranslations('pl', onDemand(false));
    expect(t.nav.blog).toBe('Dziennik pokładowy');
    // Outside the spec (`nav.compare` is Omit-ed) → from code.
    expect(t.nav.compare).toBe(getTranslations('pl').nav.compare);
    expect(t.hero).toEqual(getTranslations('pl').hero);
    expect(mockedLoadQuery).toHaveBeenLastCalledWith(expect.any(String), { id: 'uiStrings-pl' }, false);
  });

  test('missing document → error naming the document (build fails, no silent fallback)', async () => {
    mockedLoadQuery.mockResolvedValueOnce(null);
    await expect(loadTranslations('es', onDemand(false))).rejects.toThrow('uiStrings-es');
  });

  test('published document with an empty text → error listing the dotted path', async () => {
    const doc = completeDoc('it') as Record<string, Record<string, string>>;
    doc.nav = { ...doc.nav, blog: '   ' };
    mockedLoadQuery.mockResolvedValueOnce(doc);
    await expect(loadTranslations('it', onDemand(false))).rejects.toThrow(/empty texts: .*nav\.blog/);
  });

  test('draft: empty texts render as "" so the Studio can show the gap', async () => {
    const doc = completeDoc('it') as Record<string, Record<string, string>>;
    doc.nav = { ...doc.nav, blog: '' };
    mockedLoadQuery.mockResolvedValueOnce(doc);
    const t = await loadTranslations('it', onDemand(true));
    expect(t.nav.blog).toBe('');
    expect(mockedLoadQuery).toHaveBeenLastCalledWith(expect.any(String), { id: 'uiStrings-it' }, true);
  });

  test('prerendered pages share one query per language for the whole build, never drafts', async () => {
    mockedLoadQuery.mockResolvedValue(completeDoc('en'));
    const before = mockedLoadQuery.mock.calls.length;
    const page = { isPrerendered: true, locals: { draftMode: true } as App.Locals };
    const [a, b] = await Promise.all([loadTranslations('en', page), loadTranslations('en', page)]);
    await loadTranslations('en', page);
    expect(a).toBe(b);
    expect(mockedLoadQuery.mock.calls.length - before).toBe(1);
    expect(mockedLoadQuery).toHaveBeenLastCalledWith(expect.any(String), { id: 'uiStrings-en' }, false);
  });
});
