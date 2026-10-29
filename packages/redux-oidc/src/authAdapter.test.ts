// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AuthAdapter, type AuthenticationProviderUrls } from './authAdapter';

const configuration = {
  authority: 'https://authority.example',
  clientId: 'client-id',
  redirectUri: 'https://app.example/callback',
  scope: 'openid profile',
  baseUrl: 'https://api.example',
  signOutRedirectUri: 'https://app.example/dashboard',
};

const oidcConfiguration: AuthenticationProviderUrls = {
  authorizationEndpoint: 'https://authority.example/auth',
  endSessionEndpoint: 'https://authority.example/logout',
  revocationEndpoint: 'https://authority.example/revoke',
  tokenEndpoint: 'https://authority.example/token',
  userInfoEndpoint: 'https://authority.example/userinfo',
};

const signOut = async (signOutUrl?: string) => {
  const replace = vi.fn();
  vi.stubGlobal('location', { ...window.location, replace });
  const adapter = AuthAdapter.getInstance(configuration);
  vi.spyOn(adapter, 'getConfigurationEndpoints').mockResolvedValue(oidcConfiguration);

  await adapter.signOut(signOutUrl);

  expect(replace).toHaveBeenCalledOnce();
  return new URL(replace.mock.calls[0][0]);
};

describe('AuthAdapter signOut', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('passes the stored ID token as hint, so the logout is not confirmed again', async () => {
    localStorage.setItem('id_token', 'id-token');

    const logoutUrl = await signOut('https://app.example/room/room-id');

    expect(logoutUrl.origin + logoutUrl.pathname).toBe(oidcConfiguration.endSessionEndpoint);
    expect(logoutUrl.searchParams.get('client_id')).toBe(configuration.clientId);
    expect(logoutUrl.searchParams.get('post_logout_redirect_uri')).toBe('https://app.example/room/room-id');
    expect(logoutUrl.searchParams.get('id_token_hint')).toBe('id-token');
  });

  it('omits the hint without a stored ID token', async () => {
    const logoutUrl = await signOut();

    expect(logoutUrl.searchParams.get('post_logout_redirect_uri')).toBe(configuration.signOutRedirectUri);
    expect(logoutUrl.searchParams.has('id_token_hint')).toBe(false);
  });

  it('clears the stored tokens including the ID token', async () => {
    localStorage.setItem('access_token', 'access-token');
    localStorage.setItem('refresh_token', 'refresh-token');
    localStorage.setItem('id_token', 'id-token');

    await signOut();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('id_token')).toBeNull();
  });
});
