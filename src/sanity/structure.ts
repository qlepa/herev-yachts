import type { StructureBuilder } from 'sanity/structure';

export function structure(S: StructureBuilder) {
  return S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('post').title('Blog posts'),
      S.divider(),
      S.listItem()
        .title('Notification recipients')
        .id('notificationRecipients')
        .child(
          S.document()
            .schemaType('notificationRecipients')
            .documentId('notificationRecipients'),
        ),
    ]);
}
