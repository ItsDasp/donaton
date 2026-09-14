import { useAuthStore } from '../store/authStore';
import { msalInstance, loginRequest } from '../lib/msalConfig';

type QueryValue = string | number | boolean | null | undefined;

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const API_BASE_URL = rawBaseUrl?.trim().replace(/\/$/, '') ?? '';

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function getMsalAccessToken(): Promise<string | null> {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) return null;

    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });

    return response.accessToken;
  } catch {
    return null;
  }
}

async function attachAuthHeader(headers: Headers) {
  const { user, token } = useAuthStore.getState();
  // Prefer token from authStore, fall back to MSAL
  const accessToken = token || await getMsalAccessToken();
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (user?.email && !headers.has('X-User-Email')) {
    headers.set('X-User-Email', user.email);
  }
  if (user?.role && !headers.has('X-User-Role')) {
    headers.set('X-User-Role', user.role.toUpperCase());
  }
}

async function fetchWithAuth(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    query?: Record<string, QueryValue>;
    headers?: HeadersInit;
  },
  allowRefresh: boolean,
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Accept', 'application/json');
  attachAuthHeader(headers);

  const bodyPayload = options.body === undefined
    ? undefined
    : options.body instanceof FormData
      ? options.body
      : JSON.stringify(options.body);

  let response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: bodyPayload,
  });

  if (response.status !== 401 || !allowRefresh) {
    return response;
  }

  const newAccess = await getMsalAccessToken();
  if (!newAccess) return response;

  const retryHeaders = new Headers(headers);
  retryHeaders.set('Authorization', `Bearer ${newAccess}`);

  return fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers: retryHeaders,
    body: bodyPayload,
  });
}

export async function requestJson<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    query?: Record<string, QueryValue>;
    headers?: HeadersInit;
  } = {},
): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const isAuthPath = normalizedPath.startsWith('/auth/');

  let response: Response;
  try {
    response = await fetchWithAuth(path, options, !isAuthPath);
  } catch (error) {
    const err = new Error('No se pudo conectar con el backend. Verifica que el gateway esté activo y que la API permita solicitudes desde este origen.') as any;
    err.cause = error;
    throw err;
  }

  const contentType = response.headers.get('content-type') ?? '';

  let payload: any = null;
  if (response.status === 204) {
    payload = null;
  } else {
    const textBody = await response.text();
    const hasJsonBody = contentType.includes('application/json');

    if (hasJsonBody && textBody) {
      try {
        payload = JSON.parse(textBody);
      } catch {
        payload = textBody;
      }
    } else {
      payload = textBody;
    }
  }

  if (!response.ok) {
    const defaultMsg = typeof payload === 'string'
      ? payload
      : payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: string }).message)
        : `Request failed with status ${response.status}`;

    const isAuth = response.status === 401;
    const message = isAuth
      ? (typeof payload === 'string' && payload.length ? payload : 'Unauthorized: token missing or invalid')
      : defaultMsg;

    try {
      if (response.status === 401 && !isAuthPath) {
        useAuthStore.getState().logout(false);
        window.dispatchEvent(new CustomEvent('donaton:force-login', {
          detail: { status: 401, message },
        }));
      }

      if (response.status === 403) {
        useAuthStore.getState().logout(false);
        window.dispatchEvent(new CustomEvent('donaton:force-login', { detail: { status: 403, message } }));
      }
    } catch {
    }

    const err = new Error(message) as any;
    err.status = response.status;
    err.statusText = response.statusText;
    err.payload = payload;
    throw err;
  }

  return payload as T;
}

export function validateStoredAccessToken(): boolean {
  const { token } = useAuthStore.getState();
  return !!token;
}
