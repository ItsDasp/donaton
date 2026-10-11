const STORAGE_KEY = 'donaton-auth';
const SESSION_ACCESS_KEY = 'donaton-access-token';
const SESSION_REFRESH_KEY = 'donaton-refresh-token';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let storeTokenGetter: (() => string | null) | null = null;
let storeRefreshGetter: (() => string | null) | null = null;

type PersistedAuth = {
  token?: string | null;
  refreshToken?: string | null;
  state?: {
    token?: string | null;
    refreshToken?: string | null;
  };
};

export function registerStoreTokenGetters(
  getToken: () => string | null,
  getRefresh: () => string | null,
) {
  storeTokenGetter = getToken;
  storeRefreshGetter = getRefresh;
}

function readPersisted(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAuth;
  } catch {
    return null;
  }
}

function extractToken(persisted: PersistedAuth | null): string | null {
  if (!persisted) return null;
  const candidates = [persisted.token, persisted.state?.token];
  return candidates.find((t): t is string => typeof t === 'string' && t.length > 0) ?? null;
}

function extractRefresh(persisted: PersistedAuth | null): string | null {
  if (!persisted) return null;
  const candidates = [persisted.refreshToken, persisted.state?.refreshToken];
  return candidates.find((t): t is string => typeof t === 'string' && t.length > 0) ?? null;
}

export function setAuthTokens(access: string | null, refresh: string | null = null) {
  accessToken = access;
  refreshToken = refresh;

  if (access) {
    sessionStorage.setItem(SESSION_ACCESS_KEY, access);
  } else {
    sessionStorage.removeItem(SESSION_ACCESS_KEY);
  }

  if (refresh) {
    sessionStorage.setItem(SESSION_REFRESH_KEY, refresh);
  } else {
    sessionStorage.removeItem(SESSION_REFRESH_KEY);
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;

  try {
    const fromSession = sessionStorage.getItem(SESSION_ACCESS_KEY);
    if (fromSession) {
      accessToken = fromSession;
      return accessToken;
    }
  } catch {
    // ignore
  }

  if (storeTokenGetter) {
    const fromStore = storeTokenGetter();
    if (fromStore) {
      accessToken = fromStore;
      return accessToken;
    }
  }

  const persisted = readPersisted();
  const stored = extractToken(persisted);
  if (stored) {
    accessToken = stored;
    if (!refreshToken) {
      refreshToken = extractRefresh(persisted);
    }
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (refreshToken) return refreshToken;

  try {
    const fromSession = sessionStorage.getItem(SESSION_REFRESH_KEY);
    if (fromSession) {
      refreshToken = fromSession;
      return refreshToken;
    }
  } catch {
    // ignore
  }

  if (storeRefreshGetter) {
    const fromStore = storeRefreshGetter();
    if (fromStore) {
      refreshToken = fromStore;
      return refreshToken;
    }
  }

  const persisted = readPersisted();
  const stored = extractRefresh(persisted);
  if (stored) {
    refreshToken = stored;
    if (!accessToken) {
      accessToken = extractToken(persisted);
    }
  }
  return refreshToken;
}

export function isAccessTokenExpired(token: string): boolean {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return true;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function syncAuthTokensFromStorage(): boolean {
  const token = getAccessToken();
  const refresh = getRefreshToken();
  if (!token || isAccessTokenExpired(token)) {
    setAuthTokens(null, null);
    return false;
  }
  setAuthTokens(token, refresh);
  return true;
}
