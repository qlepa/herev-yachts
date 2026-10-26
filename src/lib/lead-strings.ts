import type { Translations } from './i18n-strings';
import type { LeadFormStrings } from '../islands/LeadForm';

/** Texts for the enquiry form island, picked from the page translations at build time. */
export function leadFormStrings(t: Translations, cta = t.lead.cta): LeadFormStrings {
  return {
    name: t.lead.namePlaceholder,
    contact: t.lead.contactPlaceholder,
    email: t.yachtPage.emailPlaceholder,
    phone: t.yachtPage.phonePlaceholder,
    model: t.lead.modelPlaceholder,
    message: t.lead.messagePlaceholder,
    cta,
    sending: t.leadForm.sending,
    successHeading: t.leadForm.successHeading,
    successBody: t.leadForm.successBody,
    error: t.leadForm.error,
    privacy: t.yachtPage.privacyCheckbox,
    financing: t.yachtPage.financingCheckbox,
    stockInterest: t.stock.modelOffer.interestCheckbox,
    errors: t.leadForm.errors,
  };
}
