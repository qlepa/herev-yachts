/**
 * Fixed IDs of the single-instance documents (Studio, data layer, scripts).
 * `private.*` IDs are hidden from queries without a token, also on the Free plan.
 */
export const SITE_SETTINGS_ID = 'siteSettings';
export const NOTIFICATION_RECIPIENTS_ID = 'private.notificationRecipients';
/** UI texts, one document per language. */
export const uiStringsId = (language: string) => `uiStrings-${language}`;
/** Page documents (one per page, every language inside). */
export const HOME_PAGE_ID = 'homePage';
