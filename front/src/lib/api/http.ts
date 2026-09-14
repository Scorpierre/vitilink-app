import { DEMO_MODE } from '$lib/demo/mode';
import { demoRequest } from '$lib/demo/router';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function http<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  if (DEMO_MODE) {
    return demoRequest<T>(url, options);
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || res.statusText || 'Erreur inconnue');
  }

  return data as T;
}
