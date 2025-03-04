// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { InviteCode } from '@opentalk/rest-api-rtk-query/src/types';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import convertToCamelCase from 'camelcase-keys';
import { Room } from 'livekit-client';
import convertToSnakeCase from 'snakecase-keys';

import { notifications, stopTimeLimitNotification } from '../commonComponents';
import { ConferenceRoom, shutdownConferenceContext } from '../modules/WebRTC';
import { BreakoutRoomId, JoinSuccessInternalState } from '../types';
import { getControllerBaseUrl } from '../utils/apiUtils';
import type { RootState } from './index';
import { getLivekitRoom } from './livekitRoom';

export type RoomCredentials = {
  roomId: RoomId;
  password?: string;
  inviteCode?: InviteCode;
  breakoutRoomId: BreakoutRoomId | null;
};

export const login = createAsyncThunk<{ permission: Array<string> }, string, { state: RootState; rejectValue: Error }>(
  'user/login',
  async (idToken: string, thunkApi) => {
    const { getState } = thunkApi;
    const baseUrl = getControllerBaseUrl(getState().config);
    const response = await fetch(new URL('v1/auth/login', baseUrl).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(convertToSnakeCase({ idToken })),
    });

    return convertToCamelCase(await response.json(), { deep: true });
  }
);

export const startRoom = createAsyncThunk<
  { conferenceContext: ConferenceRoom; resumption: string },
  RoomCredentials & { displayName: string },
  { state: RootState }
>('room/start', async (credentials, { getState }) => {
  const config = getState().config;
  const { resumptionToken, roomId } = getState().room;
  if (credentials.displayName.length === 0) {
    throw new Error('displayName must ne non empty');
  }
  return ConferenceRoom.create(credentials, config, credentials.roomId === roomId ? resumptionToken : undefined);
});

const stopTrackPublications = (room: Room) => {
  room.localParticipant.trackPublications.forEach((publication) => {
    publication.track?.mediaStreamTrack.stop();
    publication.track?.stop();
  });
};

export const hangUp = createAsyncThunk<void, void, { state: RootState }>('room/hangup', async () => {
  // This ensures that all notifications visible to the user prior to hanging up
  // and being redirected to the lobby room are cleared up. If you need to show
  // notification after hanging up, make sure to call it after this function.
  notifications.closeAll();
  // A workaround to disable notifications about time limitation of the conference, as they
  // have they own timeout strategy
  stopTimeLimitNotification();

  const room = getLivekitRoom();

  shutdownConferenceContext();

  stopTrackPublications(room);
  return room.disconnect();
});

export const joinSuccess = createAction<JoinSuccessInternalState>('signaling/control/join_success');
