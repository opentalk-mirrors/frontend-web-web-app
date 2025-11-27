import { jwtDecode } from 'jwt-decode';

interface CodeResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  idToken: string;
  scope: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  idToken: string;
  scope: string;
}

export enum SessionStatus {
  ANONYMOUS = 'anonymous',
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
}

export const getSavedLocation = () => sessionStorage.getItem('saved_location') || undefined;
export const saveLocationForRedirect = (location: string) => sessionStorage.setItem('saved_location', location);

export function hasActiveSession() {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const refreshExpiresIn = refreshToken && getTokenExpirationDate(refreshToken);
  if (!accessToken || !refreshToken || !refreshExpiresIn) {
    return false;
  }
  if (!Number(refreshExpiresIn) || Number.isNaN(Number(refreshExpiresIn))) {
    return false;
  }

  const adjustedClientTimeMs = getAdjustedClientTime();
  if (adjustedClientTimeMs > refreshExpiresIn) {
    return false;
  }
  return true;
}

export const getSessionStatus = () => (hasActiveSession() ? SessionStatus.AUTHORIZED : SessionStatus.ANONYMOUS);

export function hasValidToken(token: string | null) {
  if (!token) {
    return false;
  }
  const tokenExpirationTime = getTokenExpirationDate(token);
  const adjustedClientTimeMs = getAdjustedClientTime();

  return adjustedClientTimeMs < tokenExpirationTime;
}

export const storeToken = (payload: CodeResponse | RefreshTokenResponse) => {
  const { idToken, accessToken, refreshToken } = payload;
  const serverTimeOffset = getTokenIssuedDateInMs(accessToken) - new Date().getTime();
  localStorage.setItem('server_time_offset', String(serverTimeOffset));
  localStorage.setItem('id_token', idToken);
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const clearApplicationStorage = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('server_time_offset');
  sessionStorage.removeItem('code_verifier');
};

export enum AuthTypeError {
  SessionExpired = 'error-session-expired',
  OidcConfiguration = 'error-oidc-configuration',
  SystemCurrentlyUnavailable = 'error-system-currently-unavailable',
  RefreshTokenFailed = 'refresh-token-failed',
  CodeCallbackFailed = 'code-callback-failed',
  LoginUserFailed = 'login-user-failed',
}
export interface SerializedError {
  name?: AuthTypeError;
  message?: unknown;
  status?: number;
  stack?: string;
  code?: string;
}

export const getTokenExpirationDate = (token: string) => {
  const tokenExpiration = jwtDecode(token).exp as number;
  return tokenExpiration * 1000;
};

export const getTokenIssuedDateInMs = (token: string) => {
  const tokenIssuedAt = jwtDecode(token).iat as number;
  return tokenIssuedAt * 1000;
};

export const getAdjustedClientTime = () => {
  const serverTimeOffset = Number(localStorage.getItem('server_time_offset')) || 0; // calculate server offset
  const adjustedClientTimeMs = new Date().getTime() + serverTimeOffset;
  return adjustedClientTimeMs;
};

export const calculateTokenRenewalTime = (token: string) => {
  const RESPONSE_TIME = 30000; //ms
  const tokenExpirationTime = getTokenExpirationDate(token);
  const adjustedClientTimeMs = getAdjustedClientTime();

  const timeLeft = tokenExpirationTime - adjustedClientTimeMs;
  const renewalTimeInterval = Math.max(timeLeft - RESPONSE_TIME, 0);

  return renewalTimeInterval;
};

export const generateSerilizadError = (payload: SerializedError) => {
  return {
    name: payload.name || 'unable_to_fetch',
    message: String(payload.message) || 'Failed to fetch',
    status: payload.status || 503,
    stack: payload.stack,
  };
};

export const sha256HashBase64 = async (input: string) => {
  const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return urlSafeBase64Encode(new Uint8Array(buffer));
};

// must be between 43 and 128 according to the PKCE extension (RFC 7636)
const PKCE_VERIFIER_LENGTH = 128;
export const generateSafeRandomString = (length: number = PKCE_VERIFIER_LENGTH) => {
  const mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~';
  const randomUints = window.crypto.getRandomValues(new Uint8Array(length));
  let result = '';
  for (let i = 0; i < length; i++) {
    result += mask[randomUints[i] % mask.length];
  }
  return result;
};

export const generatePkceChallenge = () => {
  const codeVerifier = generateSafeRandomString();
  sessionStorage.setItem('code_verifier', codeVerifier);
  return sha256HashBase64(codeVerifier);
};

export const generateAndSaveOidcStateString = () => {
  const stateString = generateSafeRandomString();
  sessionStorage.setItem('oidc_state_parameter', stateString);
  return stateString;
};

export const urlSafeBase64Encode = (buffer: Uint8Array) => {
  const base64String = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join('');
  return window.btoa(base64String).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
};

// The goal of this XOR cipher is to add an extra layer of security by making it harder to abuse access tokens
// without analyzing the codebase. This approach is useful in scenarios such as browser plugins or other
// client-side applications where the primary goal is to prevent accidental tampering and unauthorized access,
// rather than providing high-level security.
// In this context, it's fine to store the key as a static constant.
export const XOR_KEY = '0p3nT@lk!';
export const XORCipher = {
  keyCharAt(index: number) {
    return XOR_KEY.charCodeAt(Math.floor(index % XOR_KEY.length));
  },

  fromBase64String(base64String: string) {
    const binaryString = window.atob(base64String.replace(/_/g, '/').replace(/-/g, '+'));
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  },

  xorProcess(input: Uint8Array) {
    const output = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
      output[i] = input[i] ^ this.keyCharAt(i);
    }
    return output;
  },

  handle(input: string) {
    try {
      // Try to decode as base64 string to handle decryption
      const inputArr = this.fromBase64String(input);
      const decryptedArr = this.xorProcess(inputArr);
      return new TextDecoder().decode(decryptedArr);
    } catch {
      // If base64 decoding fails, treat the input as plaintext to handle encryption
      const inputArr = new TextEncoder().encode(input);
      const encryptedArr = this.xorProcess(inputArr);
      return urlSafeBase64Encode(encryptedArr);
    }
  },
};
