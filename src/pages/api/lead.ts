import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { handleLead } from '../../lib/server/lead/handler';
import { verifyTurnstile } from '../../lib/server/lead/turnstile';
import { createDeal, type Dealer } from '../../lib/server/lead/pipedrive';
import { sendMail } from '../../lib/server/lead/resend';
import { loadNotificationRecipients } from '../../lib/server/cms/notificationRecipients';

// Serverless on Vercel; everything else in the build stays static.
export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Brand → its default dealer (content collections; the mapping never reaches the client). */
async function resolveDealer(brand: string): Promise<Dealer | undefined> {
  const brandEntry = (await getCollection('brands')).find((b) => b.data.brandKey === brand);
  if (!brandEntry) return undefined;
  const dealer = (await getCollection('dealers')).find((d) => d.data.dealerId === brandEntry.data.defaultDealer);
  if (!dealer) return undefined;
  const { dealerId, name, email, pipedriveOptionLabel } = dealer.data;
  return { dealerId, name, email, pipedriveOptionLabel };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'validation' });
  }

  const env = import.meta.env;
  const turnstileSecret = env.TURNSTILE_SECRET_KEY as string | undefined;
  if (!turnstileSecret && env.PROD) {
    console.error('lead: TURNSTILE_SECRET_KEY is not set — refusing every lead');
    return json(500, { ok: false, error: 'misconfigured' });
  }
  const pipedriveToken = env.PIPEDRIVE_API_TOKEN as string | undefined;
  const resendKey = env.RESEND_API_KEY as string | undefined;
  const from = env.LEAD_FROM_EMAIL as string | undefined;

  let ip: string | undefined;
  try {
    ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress;
  } catch {
    ip = undefined;
  }

  const result = await handleLead(body, {
    verifyTurnstile: (token) => {
      if (!turnstileSecret) {
        console.warn('lead: TURNSTILE_SECRET_KEY not set — check skipped (dev only)');
        return Promise.resolve(true);
      }
      return verifyTurnstile(token, ip, turnstileSecret);
    },
    resolveDealer,
    createDeal: (lead, dealer, consentAt) => {
      if (!pipedriveToken) return Promise.reject(new Error('PIPEDRIVE_API_TOKEN is not set'));
      return createDeal(lead, dealer, consentAt, { apiToken: pipedriveToken });
    },
    loadRecipients: loadNotificationRecipients,
    sendMail: (message) => {
      if (!resendKey || !from) return Promise.reject(new Error('RESEND_API_KEY / LEAD_FROM_EMAIL is not set'));
      return sendMail(message, { apiKey: resendKey, from });
    },
    fallbackEmail: (env.LEAD_FALLBACK_EMAIL as string | undefined) || undefined,
    log: console,
  });
  return json(result.status, result.body);
};
