// Copies the UI texts from src/lib/i18n-strings.ts into Sanity: one
// `uiStrings` document per language, fixed IDs (uiStrings-en, …).
//
//   npx sanity exec scripts/migrate-ui-strings.ts --with-user-token -- --dataset development
//
// Existing documents are left alone (texts may have been edited in the
// Studio since); --replace overwrites them with the code version.

import { getCliClient } from 'sanity/cli';
import { LOCALES } from '../src/lib/i18n';
import { getTranslations } from '../src/lib/i18n-strings';
import { uiStringsId } from '../src/sanity/uiStringsSpec';
import { toDocumentFields } from './ui-strings/convert';

const args = process.argv.slice(2);
const dataset = args[args.indexOf('--dataset') + 1];
if (!args.includes('--dataset') || !dataset) throw new Error('Pass --dataset <name>');
const replace = args.includes('--replace');

const client = getCliClient({ apiVersion: '2026-08-24' }).withConfig({ dataset });

const transaction = client.transaction();
for (const locale of LOCALES) {
  const doc = {
    _id: uiStringsId(locale),
    _type: 'uiStrings',
    language: locale,
    ...toDocumentFields(getTranslations(locale)),
  };
  if (replace) transaction.createOrReplace(doc);
  else transaction.createIfNotExists(doc);
}
const result = await transaction.commit();
console.log(`${dataset}: ${result.results.length} uiStrings documents ${replace ? 'written' : 'created if missing'}`);
