export interface MailMessage {
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
}

export interface ResendConfig {
  apiKey: string;
  /** Verified sender, e.g. `Herev <leads@herev.com>`. */
  from: string;
  fetchFn?: typeof fetch;
}

/** Plain REST call — no SDK dependency for one request. */
export async function sendMail(message: MailMessage, config: ResendConfig): Promise<void> {
  const fetchFn = config.fetchFn ?? fetch;
  const res = await fetchFn('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: config.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}
