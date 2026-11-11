// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { EventId, RoomId } from '@opentalk/rest-api-rtk-query';

import type { useLocale } from '../hooks';
import type { ConfigState } from '../store/slices/configSlice';

const createHeaders = (headers?: HeadersInit) => {
  let newHeaders;
  if (headers) {
    newHeaders = !(headers instanceof Headers) ? new Headers(headers) : headers;
  } else {
    newHeaders = new Headers();
  }
  if (!newHeaders.has('Accept')) {
    newHeaders.set('Accept', 'application/json');
  }
  return newHeaders;
};

const addEndingSlash = (string: string) => (string.charAt(string.length - 1) === '/' ? string : `${string}/`);

export const getControllerBaseUrl = ({ insecure, controller }: ConfigState) => {
  return new URL(`${insecure ? 'http' : 'https'}://${addEndingSlash(controller)}`);
};

export const getSignalingUrl = (roomserverAddress: string, token: string) => {
  const roomServer = roomserverAddress.replace('http:', 'ws:').replace('https:', 'wss:');

  return new URL(`${addEndingSlash(roomServer)}v1/signaling/${token}`);
};

export const composeRoomPath = (roomId: RoomId) => {
  return `/room/${roomId}`;
};

export const composeInviteUrl = (baseUrl: string, roomId: RoomId) => {
  const roomString = composeRoomPath(roomId);
  return new URL(roomString, baseUrl);
};

export const composeMeetingDetailsUrl = (baseUrl: string, eventId: EventId) => {
  const meetingDetailsPath = `/dashboard/meetings/${eventId}`;
  return new URL(meetingDetailsPath, baseUrl);
};

const fetchWithAccessToken = (
  url: RequestInfo | URL,
  data: RequestInit = { method: 'GET' },
  token?: string
): Promise<Response> => {
  const headers = createHeaders(data.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    if (!data.credentials) {
      data.credentials = 'same-origin';
    }
  }
  return window.fetch(url as RequestInfo, { ...data, headers });
};

// Relies on the access_token to be published at localStorage('access_token')
// This allows the usage in parts where we have no access to the redux context or the store.
// Always tries to authorize with the access token first.
// If the token is undefined, it will run into defined auth rejection from the server side
export const fetchWithAuth = async (
  url: RequestInfo | URL,
  data: RequestInit = { method: 'GET' }
): Promise<Response> => {
  const accessToken = window.localStorage.getItem('access_token') || undefined;
  return fetchWithAccessToken(url, data, accessToken);
};

/**
 * Fallback for the user manual URL when `userManualUrl` is not configured.
 * The URL is language-independent, as the docs server
 * should recognize user language and re-direct appropriately.
 */
export const DEFAULT_USER_MANUAL_URL = 'https://docs.opentalk.eu/user/manual/';
export const DEFAULT_ACCESSIBILITY_URL_EN = 'https://opentalk.eu/en/accessibility-statement';
export const DEFAULT_ACCESSIBILITY_URL_DE = 'https://opentalk.eu/de/erklaerung-zur-barrierefreiheit';

export const getAccessibilityUrl = (
  locale: ReturnType<typeof useLocale>,
  { accessibilityUrlEn, accessibilityUrlDe }: Pick<ConfigState, 'accessibilityUrlEn' | 'accessibilityUrlDe'> = {}
) => {
  return locale?.code.startsWith('de')
    ? accessibilityUrlDe || DEFAULT_ACCESSIBILITY_URL_DE
    : accessibilityUrlEn || DEFAULT_ACCESSIBILITY_URL_EN;
};

export const getLocationProtocol = () => window.location.protocol;
