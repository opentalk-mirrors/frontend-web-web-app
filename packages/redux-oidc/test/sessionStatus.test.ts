import { SessionStatus, getSessionStatus, hasExpiredSession } from '../src/utils';

const createJwt = (claims: Record<string, unknown>) => {
  const encode = (value: object) => window.btoa(JSON.stringify(value)).replace(/=/g, '');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(claims)}.signature`;
};

const nowInSeconds = () => Math.floor(Date.now() / 1000);
const HOUR_IN_SECONDS = 60 * 60;

const storeTokens = ({ accessToken, refreshToken }: { accessToken?: string; refreshToken?: string }) => {
  if (accessToken) {
    localStorage.setItem('access_token', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
  localStorage.setItem('id_token', 'id-token');
  localStorage.setItem('server_time_offset', '0');
};

describe('session status', () => {
  const expiredAccessToken = createJwt({ exp: nowInSeconds() - 30 * 24 * HOUR_IN_SECONDS });
  const validAccessToken = createJwt({ exp: nowInSeconds() + HOUR_IN_SECONDS });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('returns ANONYMOUS without touching the storage if no tokens are stored', () => {
    expect(hasExpiredSession()).toBe(false);
    expect(getSessionStatus()).toBe(SessionStatus.ANONYMOUS);
  });

  it('clears leftover tokens of an expired session so they are not sent as bearer token', () => {
    storeTokens({
      accessToken: expiredAccessToken,
      refreshToken: createJwt({ exp: nowInSeconds() - 7 * 24 * HOUR_IN_SECONDS }),
    });

    expect(hasExpiredSession()).toBe(true);
    expect(getSessionStatus()).toBe(SessionStatus.ANONYMOUS);
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('id_token')).toBeNull();
    expect(localStorage.getItem('server_time_offset')).toBeNull();
  });

  it('keeps the PKCE code verifier needed by a pending auth callback', () => {
    sessionStorage.setItem('code_verifier', 'code-verifier');
    storeTokens({
      accessToken: expiredAccessToken,
      refreshToken: createJwt({ exp: nowInSeconds() - HOUR_IN_SECONDS }),
    });

    getSessionStatus();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(sessionStorage.getItem('code_verifier')).toBe('code-verifier');
  });

  it('clears an access token that has no refresh token to renew it', () => {
    storeTokens({ accessToken: validAccessToken });

    expect(getSessionStatus()).toBe(SessionStatus.ANONYMOUS);
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('keeps the tokens of a session that can still be renewed', () => {
    const refreshToken = createJwt({ exp: nowInSeconds() + HOUR_IN_SECONDS });
    storeTokens({ accessToken: expiredAccessToken, refreshToken });

    expect(hasExpiredSession()).toBe(false);
    expect(getSessionStatus()).toBe(SessionStatus.AUTHORIZED);
    expect(localStorage.getItem('access_token')).toBe(expiredAccessToken);
    expect(localStorage.getItem('refresh_token')).toBe(refreshToken);
  });

  it('keeps the tokens if the refresh token is opaque', () => {
    storeTokens({ accessToken: validAccessToken, refreshToken: 'opaque-refresh-token' });

    expect(hasExpiredSession()).toBe(false);
    getSessionStatus();
    expect(localStorage.getItem('access_token')).toBe(validAccessToken);
  });

  it('keeps the tokens and warns if the refresh token has no expiration date', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const refreshToken = createJwt({ sub: 'user' });
    storeTokens({ accessToken: validAccessToken, refreshToken });

    expect(hasExpiredSession()).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith('Refresh token has no expiration date, keeping the stored tokens');

    getSessionStatus();
    expect(localStorage.getItem('access_token')).toBe(validAccessToken);
    expect(localStorage.getItem('refresh_token')).toBe(refreshToken);

    warnSpy.mockRestore();
  });
});
