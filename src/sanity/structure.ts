import type { StructureBuilder } from 'sanity/structure';
import { LANGUAGES } from './languages';
import { NOTIFICATION_RECIPIENTS_ID, SITE_SETTINGS_ID, uiStringsId } from './documentIds';

export function structure(S: StructureBuilder) {
  return S.list()
    .title('Treść')
    .items([
      S.listItem()
        .title('Blog')
        .id('blog')
        .child(
          S.list()
            .title('Blog')
            .items(
              LANGUAGES.map(({ value, title }) =>
                S.listItem()
                  .title(title)
                  .id(`blog-${value}`)
                  .child(
                    S.documentList()
                      .title(`Blog — ${title}`)
                      .schemaType('post')
                      .filter('_type == "post" && locale == $locale')
                      .params({ locale: value })
                      .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                      .initialValueTemplates([S.initialValueTemplateItem(`post-${value}`)]),
                  ),
              ),
            ),
        ),
      S.divider(),
      S.listItem()
        .title('Ustawienia')
        .id('settings')
        .child(
          S.list()
            .title('Ustawienia')
            .items([
              S.listItem()
                .title('Kontakt i SEO')
                .id(SITE_SETTINGS_ID)
                .child(S.document().schemaType('siteSettings').documentId(SITE_SETTINGS_ID)),
              S.listItem()
                .title('Teksty interfejsu')
                .id('uiStrings')
                .child(
                  S.list()
                    .title('Teksty interfejsu')
                    .items(
                      LANGUAGES.map(({ value, title }) =>
                        S.listItem()
                          .title(title)
                          .id(uiStringsId(value))
                          .child(S.document().schemaType('uiStrings').documentId(uiStringsId(value)).title(`Teksty interfejsu — ${title}`)),
                      ),
                    ),
                ),
              S.listItem()
                .title('Odbiorcy powiadomień')
                .id('notificationRecipients')
                .child(S.document().schemaType('notificationRecipients').documentId(NOTIFICATION_RECIPIENTS_ID)),
            ]),
        ),
    ]);
}
