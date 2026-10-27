import { describe, expect, test } from 'vitest';
import { sendMail } from './resend';
import { fakeFetch, json } from '../../../test/fakeFetch';

const message = { to: ['a@herev.com', 'b@herev.com'], subject: 'Lead', text: 'plain', html: '<p>html</p>' };
const config = { apiKey: 're_test', from: 'Herev <leads@herev.com>' };

describe('sendMail', () => {
  test('posts the message to Resend with the bearer key; reply_to only when given', async () => {
    const { fetchFn, calls } = fakeFetch({ 'api.resend.com/emails': () => json({ id: 'msg_1' }) });
    await sendMail({ ...message, replyTo: 'jan@example.com' }, { ...config, fetchFn });
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('POST');
    expect(calls[0].headers.authorization).toBe('Bearer re_test');
    expect(calls[0].body).toEqual({ ...message, from: config.from, reply_to: 'jan@example.com' });

    await sendMail(message, { ...config, fetchFn });
    expect(calls[1].body).not.toHaveProperty('reply_to');
  });

  test('a non-2xx answer throws with the status and the start of the body', async () => {
    const { fetchFn } = fakeFetch({
      'api.resend.com/emails': () => new Response('x'.repeat(1000), { status: 422 }),
    });
    await expect(sendMail(message, { ...config, fetchFn })).rejects.toThrow(/^Resend 422: x{300}$/);
  });
});
