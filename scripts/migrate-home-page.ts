// Creates the „Strona główna” document (`homePage`) in Sanity: texts copied
// from src/lib/i18n-strings.ts (all languages), images uploaded from
// src/assets, the hero video link and its poster (Vimeo thumbnail) as they
// were hard-coded in src/pages/[lang]/index.astro before the CMS.
//
//   npx sanity exec scripts/migrate-home-page.ts --with-user-token -- --dataset development
//
// An existing document is left alone (it may have been edited in the
// Studio since); --replace overwrites it with the code version.

import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { getCliClient } from 'sanity/cli';
import { LOCALES, type Locale } from '../src/lib/i18n';
import { getTranslations, type Translations } from '../src/lib/i18n-strings';
import { HOME_PAGE_ID } from '../src/sanity/documentIds';

const args = process.argv.slice(2);
const dataset = args[args.indexOf('--dataset') + 1];
if (!args.includes('--dataset') || !dataset) throw new Error('Pass --dataset <name>');
const replace = args.includes('--replace');

const client = getCliClient({ apiVersion: '2026-08-24' }).withConfig({ dataset });

if (!replace && (await client.getDocument(HOME_PAGE_ID))) {
  console.log(`${dataset}: ${HOME_PAGE_ID} already exists — nothing to do (use --replace to overwrite)`);
  process.exit(0);
}

const t = Object.fromEntries(LOCALES.map((locale) => [locale, getTranslations(locale)])) as Record<Locale, Translations>;

/** A multilingual field (sanity-plugin-internationalized-array, v5 shape). */
function localized<T>(type: 'String' | 'Text' | 'Seo', pick: (t: Translations) => T) {
  return LOCALES.map((language) => ({
    _key: randomUUID().slice(0, 12),
    _type: `internationalizedArray${type}Value`,
    language,
    value: pick(t[language]),
  }));
}
const string = (pick: (t: Translations) => string) => localized('String', pick);
const text = (pick: (t: Translations) => string) => localized('Text', pick);
/** Alt texts were English on every language version; translations are for the content team. */
const sameAlt = (alt: string) => string(() => alt);

/** Uploads an image (AVIF converted to JPEG, which every Sanity transform accepts). */
async function upload(source: Buffer, filename: string, alt: string) {
  const jpeg = await sharp(source).jpeg({ quality: 90 }).toBuffer();
  const asset = await client.assets.upload('image', jpeg, { filename: filename.replace(/\.\w+$/, '.jpg') });
  console.log(`  uploaded ${filename} → ${asset._id}`);
  return { _type: 'pageImage', asset: { _type: 'reference', _ref: asset._id }, alt: sameAlt(alt) };
}
const fromFile = (path: string, alt: string) => upload(readFileSync(path), path.split('/').pop()!, alt);

async function vimeoPoster(videoId: string) {
  const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}&width=1920`);
  if (!res.ok) throw new Error(`Vimeo oEmbed: HTTP ${res.status}`);
  const { thumbnail_url } = (await res.json()) as { thumbnail_url: string };
  // oEmbed returns a 1280 px thumbnail whatever the width asked; the CDN serves larger sizes.
  const full = thumbnail_url.replace(/-d_\d+/, '-d_1920');
  return Buffer.from(await (await fetch(full)).arrayBuffer());
}

function bullets(pick: (t: Translations) => Array<{ lead: string; rest: string }>) {
  const counts = new Set(LOCALES.map((locale) => pick(t[locale]).length));
  if (counts.size !== 1) throw new Error('Advisory bullets differ in number between languages');
  return pick(t.en).map((_, i) => ({
    _key: randomUUID().slice(0, 12),
    _type: 'bullet',
    lead: string((t) => pick(t)[i].lead),
    rest: text((t) => pick(t)[i].rest),
  }));
}

const stat = (value: string, label: (t: Translations) => string) => ({
  _key: randomUUID().slice(0, 12),
  _type: 'stat',
  value,
  label: string(label),
});

for (const locale of LOCALES) {
  const { title, description } = t[locale].meta;
  if (title.length > 60 || description.length > 160) {
    console.warn(`  ${locale}: SEO title ${title.length}/60, description ${description.length}/160 — the Studio will flag it`);
  }
}

console.log(`${dataset}: uploading images…`);
const doc = {
  _id: HOME_PAGE_ID,
  _type: 'homePage',
  hero: {
    heading: string((t) => t.hero.heading),
    subtext: text((t) => t.hero.subtext),
    cta1: string((t) => t.hero.cta1),
    cta2: string((t) => t.hero.cta2),
    video:
      'https://player.vimeo.com/progressive_redirect/playback/1185484138/rendition/1080p/file.mp4%20%281080p%29.mp4?loc=external&oauth2_token_id=1799510047&signature=85041f5fdc32ddad1d3e0c1bfe3c7f45a2ad09386863675518639a098fb22027',
    image: await upload(await vimeoPoster('1185484138'), 'homepage-hero-poster.jpg', 'A Saxdor yacht under way on open water'),
  },
  intro: {
    eyebrow: string((t) => t.intro.eyebrow),
    heading: text((t) => t.intro.heading),
    body: text((t) => t.intro.body),
    stats: [
      stat('5', (t) => t.intro.statLabels.ateliers),
      stat('17', (t) => t.intro.statLabels.years),
      stat('1', (t) => t.intro.statLabels.relationship),
    ],
  },
  advisory: {
    advise: {
      heading: text((t) => t.advisory.advise.heading),
      bullets: bullets((t) => t.advisory.advise.bullets),
      image: await fromFile('src/assets/yachts/galeon-500-fly/hero.avif', 'Galeon flybridge yacht under way'),
    },
    represent: {
      heading: text((t) => t.advisory.represent.heading),
      bullets: bullets((t) => t.advisory.represent.bullets),
      image: await fromFile('src/assets/yachts/saxdor-400-gtc/hero.jpeg', 'Saxdor yacht at speed on open water'),
    },
  },
  guide: {
    heading: string((t) => t.guide.heading),
    body: text((t) => t.guide.body),
    emailPlaceholder: string((t) => t.guide.emailPlaceholder),
    cta: string((t) => t.guide.cta),
  },
  shipyards: {
    eyebrow: string((t) => t.shipyards.eyebrow),
    heading: string((t) => t.shipyards.heading),
    body: text((t) => t.shipyards.body),
    image: await fromFile('src/assets/site/homepage-hero.jpeg', 'Yachts running in formation along the coast'),
  },
  statement: {
    headingLine1: string((t) => t.statement.headingLine1),
    headingLine2: string((t) => t.statement.headingLine2),
    body: text((t) => t.statement.body),
  },
  network: {
    eyebrow: string((t) => t.network.eyebrow),
    heading: string((t) => t.network.heading),
    body: text((t) => t.network.body),
    countriesLabel: string((t) => t.network.countries),
    stats: [stat('30+', (t) => t.network.berths), stat('60+', (t) => t.network.models)],
    linkLabel: string((t) => t.network.linkLabel),
    image: await fromFile('src/assets/site/cannes-marina.avif', 'Marina with yachts at sunset'),
    imageCaption: string((t) => t.network.imageCaption),
  },
  seo: localized('Seo', (t) => ({ _type: 'seo', title: t.meta.title, description: t.meta.description })),
};

await client.createOrReplace(doc);
console.log(`${dataset}: ${HOME_PAGE_ID} ${replace ? 'replaced' : 'created'}`);
