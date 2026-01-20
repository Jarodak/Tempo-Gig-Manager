import type { Gig } from './types';

type Json = Record<string, unknown>;

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const resp = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const text = await resp.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);

  if (!resp.ok) {
    throw new Error((data as unknown as Json)?.error ? String((data as unknown as Json).error) : `Request failed: ${resp.status}`);
  }

  return data;
};

export const getGigs = async (): Promise<Gig[]> => {
  const data = await apiFetch<{ gigs: Gig[] }>('/api/gigs_list');
  return Array.isArray(data.gigs) ? data.gigs : [];
};

export const createGig = async (gig: Partial<Gig>): Promise<Gig> => {
  const data = await apiFetch<{ gig: Gig }>('/api/gigs_create', {
    method: 'POST',
    body: JSON.stringify(gig),
  });
  return data.gig;
};

export const testConnection = async (): Promise<{ ok: boolean; error?: string }> => {
  try {
    await apiFetch('/api/gigs_list');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
