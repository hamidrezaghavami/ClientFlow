const apiUrl = process.env.NEXT_PUBLIC_CLIENTFLOW_API_URL?.replace(/\/$/, '');

export async function postApi(path: string, body: object, signal: AbortSignal, token?: string | null) {
  if (!apiUrl) throw new Error('The ClientFlow API is unavailable.');
  return fetch(`${apiUrl}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
    signal,
  });
}
