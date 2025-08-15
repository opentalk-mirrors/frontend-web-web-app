// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AuthTypeError, authError } from '@opentalk/redux-oidc';
import { RoomId, createOpenTalkApiWithReactHooks, fetchQuery } from '@opentalk/rest-api-rtk-query';
import { Middleware, createAsyncThunk, isAction, isRejectedWithValue } from '@reduxjs/toolkit';
import camelcaseKeys from 'camelcase-keys';
import convertToSnakeCase from 'snakecase-keys';

import type { RootState } from '../store';
import { FetchRequestError, ParticipantId } from '../types';
import { fetchWithAuth, getControllerBaseUrl } from '../utils/apiUtils';

export interface ApiErrorWithBody<T extends string> {
  code: T;
  message: string;
}

export function isApiError<T>(error: unknown): error is ApiErrorWithBody<T extends string ? string : never> {
  return error !== null && typeof error === 'object' && 'code' in error;
}

type NewRoom = {
  password?: string;
};

export interface Room {
  id: RoomId;
  owner: ParticipantId;
  password?: string;
}

type FeedbackData = {
  lang: string;
  browser: string;
  form: Array<FeedbackFormData>;
};

interface FeedbackFormData {
  name: string;
  type: 'rating' | 'text';
  value: string;
}

export enum StartRoomError {
  WrongRoomPassword = 'wrong_room_password',
  InvalidCredentials = 'invalid_credentials',
  InvalidBreakoutRoomId = 'invalid_breakout_room_id',
  NoBreakoutRooms = 'no_breakout_rooms',
  InvalidJson = 'invalid_json',
  NotFound = 'not_found',
  Forbidden = 'forbidden',
  Unauthorized = 'unauthorized',
  BadRequest = 'bad_request',
}

export enum AuthTypeErrorMessage {
  InvalidTokenOrInvite = 'Unable to parse access token or invite code',
}

export const addRoom = createAsyncThunk<Room, NewRoom, { state: RootState; rejectValue: FetchRequestError }>(
  'control/addRoom',
  async (newRoomRequest, thunkApi) => {
    const { getState, rejectWithValue } = thunkApi;

    // Fetch new credentials
    const response = await fetchWithAuth(new URL('v1/rooms', getControllerBaseUrl(getState().config)), {
      method: 'POST',
      body: JSON.stringify(convertToSnakeCase(newRoomRequest)),
    });

    if (!response.ok) {
      return rejectWithValue({
        status: response.status,
        statusText: await response.text(),
      });
    }
    return camelcaseKeys(await response.json(), { deep: true }) as Room;
  }
);

export const sendFeedback = createAsyncThunk<void, FeedbackData, { state: RootState }>(
  'control/feedback',
  async (newFeedback, { getState }) => {
    const { userSurveyUrl, userSurveyApiKey } = getState().config;

    if (userSurveyUrl === undefined || userSurveyApiKey === undefined) {
      throw new Error('user survey params are not configured');
    }
    const response = await fetch(new URL(userSurveyUrl), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': userSurveyApiKey,
      },
      body: JSON.stringify(convertToSnakeCase(newFeedback)),
    });

    if (!response.ok) {
      throw new Error(`user survey submission failed with code ${response.status}: ${await response.text()}`);
    }
  }
);

const baseQuery = fetchQuery({
  baseUrl: ({ getState }) => `${getControllerBaseUrl((getState() as RootState).config).toString()}v1`,
  prepareHeaders: (headers) => {
    // Don't override existing authorization header, e.g. invite code
    if (!headers.get('authorization')) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
    }
    return headers;
  },
});

export const restApi = createOpenTalkApiWithReactHooks(baseQuery);

export const rtkQueryErrorLoggerMiddleware: Middleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    // Auth library is handling only auth errors with name: AuthTypeError.RefreshTokenFailed && AuthTypeError.SessionExpired
    // If rtk query get rejected dispatch auth error
    if (isAction(action) && isRejectedWithValue(action)) {
      // At some point we could define a common type for rejected payload
      const payload = action.payload as { status: number; data: { message: string } };

      if (payload.status === 401) {
        if (payload.data.message === AuthTypeErrorMessage.InvalidTokenOrInvite) {
          // Don't dispatch any auth error since this is an exeption. Is not auth error, it's wrong Url and or/invite code.
          return next(action);
        }
        dispatch(
          authError({
            status: payload.status,
            name: AuthTypeError.SessionExpired,
            message: payload.data.message,
          })
        );
        return next(action);
      }
      if (payload.status === 403) {
        // Warning: This can be potentially dangereous as we don't know
        // what pandora's box we are openning, before hand this middleware
        // couldn't even finish up on 403 as it would come to this sopt and be
        // left unhandled as next callback was never called.
        return next(action);
      }
      if (payload.status >= 500) {
        dispatch(
          authError({
            status: payload.status,
            name: AuthTypeError.SystemCurrentlyUnavailable,
            message: AuthTypeError.SystemCurrentlyUnavailable,
          })
        );
        return next(action);
      }
    }
    return next(action);
  };

// Re-export the most common api hooks
export const {
  useDeleteEventMutation,
  useMarkFavoriteEventMutation,
  useUnmarkFavoriteEventMutation,
  useGetMeQuery,
  useGetMeTariffQuery,
  useGetRoomTariffQuery,
  useLazyGetMeQuery,
  useGetEventsQuery,
  useLazyGetEventsQuery,
  useCreateEventMutation,
  useUpdateMeMutation,
  useFindUsersQuery,
  useLazyFindUsersQuery,
  useCreateEventInviteMutation,
  useUpdateRoomSipConfigMutation,
  useGetEventQuery,
  useLazyGetEventQuery,
  useUpdateEventMutation,
  useAcceptEventInviteMutation,
  useDeclineEventInviteMutation,
  useRevokeEventUserInviteByEmailMutation,
  useRevokeEventUserInviteMutation,
  useGetRoomQuery,
  useGetRoomInvitesQuery,
  useGetRoomAssetsQuery,
  useDeleteRoomMutation,
  useDeleteRoomAssetMutation,
  useCreateRoomInviteMutation,
  useLazyGetRoomInvitesQuery,
  useCreateEventSharedFolderMutation,
  useDeleteEventSharedFolderMutation,
  useUpdateEventInstanceMutation,
  useGetRoomEventInfoQuery,
  useGetEventInvitesQuery,
  useUpdateEventInviteMutation,
  useGetStreamingTargetsQuery,
  useAddStreamingTargetsMutation,
  useGetEventInstanceQuery,
  useGetUserOwnedAssetsQuery,
} = restApi;
