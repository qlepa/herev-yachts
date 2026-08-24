import { defineField, defineType } from 'sanity';

export const notificationRecipientsType = defineType({
  name: 'notificationRecipients',
  title: 'Notification recipients',
  type: 'document',
  fields: [
    defineField({
      name: 'emails',
      title: 'Emails',
      description: 'Every address on this list receives a Resend notification for each new lead.',
      type: 'array',
      of: [
        {
          type: 'string',
          validation: (Rule) => Rule.email(),
        },
      ],
    }),
  ],
  preview: {
    select: { emails: 'emails' },
    prepare({ emails }) {
      return {
        title: 'Notification recipients',
        subtitle: Array.isArray(emails) ? `${emails.length} address(es)` : 'No addresses',
      };
    },
  },
});
