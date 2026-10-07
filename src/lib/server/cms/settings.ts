import { stegaClean } from '@sanity/client/stega';
import { urlForImage, type SanityImage } from '../../sanityImage';
import { SITE_SETTINGS_ID } from '../../../sanity/documentIds';
import { loadQuery } from './client';

export interface SiteSettings {
  email: string;
  phone?: string;
  /** Appended to page titles, e.g. "— Herev". */
  titleSuffix: string;
  /** Default share image (1200×630), absolute URL. */
  ogImageUrl?: string;
  socialProfiles: string[];
}

interface SiteSettingsDocument {
  email?: string;
  phone?: string;
  titleSuffix?: string;
  ogImage?: SanityImage;
  socialProfiles?: string[];
}

export function toSiteSettings(doc: SiteSettingsDocument | null, draftMode: boolean): SiteSettings {
  if (!doc) throw new Error(`Sanity: document ${SITE_SETTINGS_ID} (Kontakt i SEO) does not exist`);
  // Values end up in hrefs, <title> and JSON-LD — no stega there.
  const email = stegaClean(doc.email ?? '');
  const titleSuffix = stegaClean(doc.titleSuffix ?? '');
  if ((!email || !titleSuffix) && !draftMode) {
    throw new Error(`Sanity: ${SITE_SETTINGS_ID} needs an e-mail and a title suffix`);
  }
  return {
    email,
    phone: stegaClean(doc.phone) || undefined,
    titleSuffix,
    ogImageUrl: doc.ogImage?.asset
      ? urlForImage(doc.ogImage).width(1200).height(630).fit('crop').format('jpg').url()
      : undefined,
    socialProfiles: stegaClean(doc.socialProfiles ?? []),
  };
}

let buildCache: Promise<SiteSettings> | undefined;

/** Site-wide settings; one query for the whole build, per request on the CMS. */
export function loadSiteSettings(page: { isPrerendered: boolean; draftMode: boolean }): Promise<SiteSettings> {
  const fetch = (draftMode: boolean) =>
    loadQuery<SiteSettingsDocument | null>('*[_id == $id][0]', { id: SITE_SETTINGS_ID }, draftMode).then((doc) =>
      toSiteSettings(doc, draftMode),
    );
  if (!page.isPrerendered) return fetch(page.draftMode);
  buildCache ??= fetch(false);
  return buildCache;
}
