import type { StructureBuilder } from 'sanity/structure';
import { LANGUAGES } from './languages';

/** Fixed IDs of single-instance documents. `private.*` IDs are hidden from the public API. */
export const NOTIFICATION_RECIPIENTS_ID = 'private.notificationRecipients';

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
                .title('Odbiorcy powiadomień')
                .id('notificationRecipients')
                .child(S.document().schemaType('notificationRecipients').documentId(NOTIFICATION_RECIPIENTS_ID)),
            ]),
        ),
    ]);
}
