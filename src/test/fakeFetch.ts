import { vi } from 'vitest';

export interface FetchCall {
  url: URL;
  method: string;
  headers: Record<string, string>;
  /** Parsed JSON body, or the raw string for form bodies. */
  body?: unknown;
}

type Route = (call: FetchCall) => Response | Promise<Response>;

/**
 * `fetch` stand-in for the integrations (Turnstile, Pipedrive, Resend):
 * routes are matched by `host + pathname` prefix, every call is recorded.
 * Unmatched URLs answer 404 so a test never reaches the network by accident.
 */
export function fakeFetch(routes: Record<string, Route>) {
  const calls: FetchCall[] = [];
  const fetchFn = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const raw = init?.body;
    let body: unknown;
    if (typeof raw === 'string') {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    } else if (raw instanceof URLSearchParams) {
      body = Object.fromEntries(raw);
    }
    const call: FetchCall = {
      url,
      method: init?.method ?? 'GET',
      headers: Object.fromEntries(new Headers(init?.headers)),
      body,
    };
    calls.push(call);
    const key = `${url.host}${url.pathname}`;
    const route = Object.entries(routes).find(([prefix]) => key.startsWith(prefix))?.[1];
    return route ? route(call) : new Response('fakeFetch: no route', { status: 404 });
  });
  return { fetchFn: fetchFn as unknown as typeof fetch, calls };
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
