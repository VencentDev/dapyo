import type { paths } from '@app/api-types';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8080';

export function apiUrl(path: string) {
  return /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public payload: unknown,
    message: string,
  ) {
    super(message);
  }
}

async function apiFetch<T>(
  token: string | undefined,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(apiUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    let payload: unknown;

    try {
      payload = await res.json();
    } catch {
      payload = undefined;
    }

    throw new ApiError(res.status, payload, `api_${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function serverApi<T>(path: string, init?: RequestInit): Promise<T> {
  const { auth } = await import('@/lib/auth');
  const session = await auth();

  return apiFetch<T>(session?.accessToken, path, init);
}

export async function clientApi<T>(
  token: string | undefined,
  path: string,
  init?: RequestInit,
): Promise<T> {
  return apiFetch<T>(token, path, init);
}

export type Paths = paths;
