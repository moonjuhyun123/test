import { ApiError, type ApiResponse, type ErrorBody } from '@/types/api';

const TOKEN_KEY = 'calendar.accessToken';

export const authStorage = {
  get(): string | null {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

function baseUrl(): string {
  return import.meta.env.VITE_API_BASE || '/api';
}

function buildHeaders(body?: unknown, extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {};
  const token = authStorage.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json; charset=UTF-8';
  }
  return { ...headers, ...(extra as Record<string, string> | undefined) };
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const payload = text ? (JSON.parse(text) as ApiResponse<T>) : null;

  if (!res.ok) {
    const err: ErrorBody = payload?.error ?? {
      code: `HTTP-${res.status}`,
      message: res.statusText || 'request failed',
      details: [],
      path: ''
    };
    if (res.status === 401) authStorage.clear();
    throw ApiError.fromErrorBody(res.status, err);
  }

  return (payload?.data ?? null) as T;
}

export async function apiGet<T>(path: string, query?: Record<string, unknown>): Promise<T> {
  const url = query ? `${baseUrl()}${path}?${toQuery(query)}` : `${baseUrl()}${path}`;
  const res = await fetch(url, { method: 'GET', headers: buildHeaders() });
  return parse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: buildHeaders(body),
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined
  });
  return parse<T>(res);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(body),
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  return parse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: 'DELETE',
    headers: buildHeaders()
  });
  return parse<T>(res);
}

export function toQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) sp.append(key, String(v));
    } else {
      sp.append(key, String(value));
    }
  }
  return sp.toString();
}
