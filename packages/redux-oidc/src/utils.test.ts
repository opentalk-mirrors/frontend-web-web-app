// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { storeToken } from './utils';

// Unsigned JWT with an `iat` claim, enough to derive the server time offset
const createToken = (issuedAtSeconds: number) =>
  `header.${window.btoa(JSON.stringify({ iat: issuedAtSeconds }))}.signature`;

const tokenResponse = {
  accessToken: createToken(Math.floor(Date.now() / 1000)),
  expiresIn: 300,
  refreshToken: 'refresh-token',
  refreshExpiresIn: 1800,
  scope: 'openid profile',
};

describe('storeToken', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('stores the ID token of the token response', () => {
    storeToken({ ...tokenResponse, idToken: 'id-token' });

    expect(localStorage.getItem('access_token')).toBe(tokenResponse.accessToken);
    expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
    expect(localStorage.getItem('id_token')).toBe('id-token');
  });

  it('keeps the previous ID token if the response does not contain one', () => {
    localStorage.setItem('id_token', 'previous-id-token');

    storeToken(tokenResponse);

    expect(localStorage.getItem('id_token')).toBe('previous-id-token');
  });
});
