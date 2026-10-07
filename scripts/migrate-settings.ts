// Creates the settings documents in Sanity: UI texts copied from
// src/lib/i18n-strings.ts (one `uiStrings` document per language, fixed IDs
// uiStrings-en, …) and „Kontakt i SEO” (`siteSettings`) with the values the
// site used before the CMS.
//
//   npx sanity exec scripts/migrate-settings.ts --with-user-token -- --dataset development
//
// Existing documents are left alone (texts may have been edited in the
// Studio since); --replace overwrites them with the code version.

import { getCliClient } from 'sanity/cli';
import { LOCALES } from '../src/lib/i18n';
import { getTranslations } from '../src/lib/i18n-strings';
import { SITE_SETTINGS_ID, uiStringsId } from '../src/sanity/documentIds';
import { toDocumentFields } from './ui-strings/convert';

const args = process.argv.slice(2);
const dataset = args[args.indexOf('--dataset') + 1];
if (!args.includes('--dataset') || !dataset) throw new Error('Pass --dataset <name>');
const replace = args.includes('--replace');

const client = getCliClient({ apiVersion: '2026-08-24' }).withConfig({ dataset });

const transaction = client.transaction();
const write = (doc: { _id: string; _type: string; [field: string]: unknown }) =>
  replace ? transaction.createOrReplace(doc) : transaction.createIfNotExists(doc);

for (const locale of LOCALES) {
  const doc = {
    _id: uiStringsId(locale),
    _type: 'uiStrings',
    language: locale,
    ...toDocumentFields(getTranslations(locale)),
  };
  write(doc);
}
write({ _id: SITE_SETTINGS_ID, _type: 'siteSettings', email: 'info@herev.com', titleSuffix: '— Herev' });
const result = await transaction.commit();
console.log(`${dataset}: ${result.results.length} settings documents ${replace ? 'written' : 'created if missing'}`);
