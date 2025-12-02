export async function http(url: string, options: RequestInit = {}) {
  const res = await fetch(`http://localhost:3000${url}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || res.statusText || 'Erreur inconnue');
  }

  return data;
}
