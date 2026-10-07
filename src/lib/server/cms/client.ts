import { createClient } from '@sanity/client';
import { queryOptions } from './draftMode';

export const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2026-08-24',
  // Builds and the preview must see content the moment it is published.
  useCdn: false,
  token: import.meta.env.SANITY_API_READ_TOKEN,
  perspective: 'published',
  stega: { enabled: false, studioUrl: '/admin' },
});

export async function loadQuery<T>(
  query: string,
  params: Record<string, unknown>,
  draftMode: boolean,
): Promise<T> {
  return client.fetch<T>(query, params, queryOptions(draftMode));
}
