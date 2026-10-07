import { defineField, defineType } from 'sanity';

export const notificationRecipientsType = defineType({
  name: 'notificationRecipients',
  title: 'Odbiorcy powiadomień',
  type: 'document',
  fields: [
    defineField({
      name: 'emails',
      title: 'Adresy e-mail',
      description:
        'Każdy adres z listy dostaje e-mail o każdym nowym zapytaniu ze strony. Ten dokument nie jest widoczny publicznie.',
      type: 'array',
      of: [
        {
          type: 'string',
          validation: (Rule) => Rule.email().error('Nieprawidłowy adres e-mail'),
        },
      ],
    }),
  ],
  preview: {
    select: { emails: 'emails' },
    prepare({ emails }) {
      return {
        title: 'Odbiorcy powiadomień',
        subtitle: Array.isArray(emails) ? `Adresów: ${emails.length}` : 'Brak adresów',
      };
    },
  },
});
