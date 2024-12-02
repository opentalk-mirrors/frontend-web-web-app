// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InviteCode, RoomId, EventId } from '@opentalk/rest-api-rtk-query';

import { ConfigState, DefaultAvatarImage } from '../store/slices/configSlice';
import { BreakoutRoomId } from '../types';

type Fetch = typeof window.fetch;

const createHeaders = (headers?: HeadersInit) => {
  if (headers) {
    return !(headers instanceof Headers) ? new Headers(headers) : headers;
  } else {
    return new Headers();
  }
};

const addEndingSlash = (string: string) => (string.charAt(string.length - 1) === '/' ? string : `${string}/`);

export const getControllerBaseUrl = ({ insecure, controller }: ConfigState) => {
  return new URL(`${insecure ? 'http' : 'https'}://${addEndingSlash(controller)}`);
};

export const getSignalingUrl = ({ insecure, controller }: ConfigState) => {
  return new URL(`${insecure ? 'ws' : 'wss'}://${addEndingSlash(controller)}signaling`);
};

export const composeRoomPath = (roomId: RoomId, inviteCode?: InviteCode, breakoutRoomId?: BreakoutRoomId | null) => {
  return `/room/${roomId}${breakoutRoomId ? `/${breakoutRoomId}` : ``}${inviteCode ? `?invite=${inviteCode}` : ''}`;
};

export const composeInviteUrl = (
  baseUrl: string,
  roomId: RoomId,
  inviteCode?: InviteCode,
  breakoutRoomId?: BreakoutRoomId | null
) => {
  const roomString = composeRoomPath(roomId, inviteCode, breakoutRoomId);
  return new URL(roomString, baseUrl);
};

export const composeMeetingDetailsUrl = (baseUrl: string, eventId: EventId) => {
  const meetingDetailsPath = `/dashboard/meetings/${eventId}`;
  return new URL(meetingDetailsPath, baseUrl);
};

const fetchWrapper = (
  url: RequestInfo | URL,
  data: RequestInit = { method: 'GET' },
  fetch: Fetch,
  token?: string
): Promise<Response> => {
  const headers = createHeaders(data.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    if (!data.credentials) {
      data.credentials = 'same-origin';
    }
  }
  return fetch(url as RequestInfo, { ...data, headers });
};

export const fetchWithInviteWrapper =
  (fetch: Fetch) =>
  (url: RequestInfo | URL, data: RequestInit = { method: 'GET' }, inviteCode: string): Promise<Response> =>
    fetchWrapper(url, data, fetch, inviteCode);

export const fetchWithInvite = fetchWithInviteWrapper(window.fetch);

// Relies on the access_token to be published at localStorage('access_token')
// This allows the usage in parts where we have no access to the redux context or the store.
export const fetchWithAuthWrapper =
  (fetch: Fetch, storage: Storage) =>
  async (url: RequestInfo | URL, data: RequestInit = { method: 'GET' }): Promise<Response> => {
    const access_token = storage.getItem('access_token') || undefined;
    return fetchWrapper(url, data, fetch, access_token);
  };

export const fetchWithAuth = fetchWithAuthWrapper(window.fetch, window.localStorage);

type LibravatarOptions = {
  size?: number;
  defaultImage?: DefaultAvatarImage;
};

/**
 * Add defaultImage parameter to a libravatarUrl
 *
 * @param url A libravatarUrl
 * @param options Options to modify the libravartUrl defaultImage = d in the documentation https://wiki.libravatar.org/api/
 */
export const addParameterToLibravatarUrl = (
  url: string,
  { size = 512, defaultImage = 'robohash' }: LibravatarOptions
) => {
  return `${url}?d=${defaultImage}&s=${size}`;
};

/**
 * Open user manual in a new tab
 * The URL is language-independent, as the docs server
 * should recognize user language and re-direct appropriately.
 *
 */
export const USER_MANUAL_URL = 'https://docs.opentalk.eu/user/manual/';
export const openUserManual = () => {
  window.open(USER_MANUAL_URL, '_blank');
};
