// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';

import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { ParticipantId } from '../../types';
import { hangUp, joinSuccess, startRoom } from '../commonActions';
import roomReducer, { connectionClosed, joinBlocked, joinedLobby, setCanEnter, RoomState } from './roomSlice';

describe('roomSlice - connectionClosed', () => {
  const getStateAfterClose = (initState: RoomState, errorCode?: number) => {
    const afterCloseState = roomReducer(initState, connectionClosed({ errorCode }));
    return afterCloseState;
  };

  it('transitions to "Left" on a graceful close (no error code) so the lobby is shown after debriefing', () => {
    const initState = roomReducer(undefined, { type: '@@INIT' });
    expect(getStateAfterClose(initState, undefined).connectionState).toBe(ConnectionState.Left);
  });

  it('transitions to "Failed" when the connection closes with an error code', () => {
    const initState = roomReducer(undefined, { type: '@@INIT' });
    expect(getStateAfterClose(initState, 1006).connectionState).toBe(ConnectionState.Failed);
  });

  it('resets the joined-conference flag on a graceful close (no error code)', () => {
    const joinedState: RoomState = {
      ...roomReducer(undefined, { type: '@@INIT' }),
      hasJoinedConference: true,
    };

    expect(getStateAfterClose(joinedState, undefined).hasJoinedConference).toBe(false);
  });

  it('keeps the joined-conference flag when closing with an error code (silent reconnect)', () => {
    const joinedState: RoomState = {
      ...roomReducer(undefined, { type: '@@INIT' }),
      hasJoinedConference: true,
    };

    expect(getStateAfterClose(joinedState, 1006).hasJoinedConference).toBe(true);
  });

  it('ignores a trailing close while already leaving so it does not turn into a failed connection', () => {
    const leavingState = roomReducer(undefined, { type: hangUp.pending.type });
    expect(leavingState.connectionState).toBe(ConnectionState.Leaving);

    const afterClose = roomReducer(leavingState, connectionClosed({ errorCode: 1006 }));

    expect(afterClose.connectionState).toBe(ConnectionState.Leaving);
  });

  it('keeps the blocked state when the roomserver closes the socket after "join_blocked"', () => {
    const blockedState = roomReducer(undefined, joinBlocked({ reason: 'participant_limit_reached' }));
    expect(blockedState.connectionState).toBe(ConnectionState.Blocked);

    const afterClose = roomReducer(blockedState, connectionClosed({ errorCode: 1013 }));

    expect(afterClose.connectionState).toBe(ConnectionState.Blocked);
    expect(afterClose.error).toBe('participant_limit_reached');
  });
});

describe('roomSlice - automatic retry while blocked', () => {
  const blockedAndClosed = () => {
    const blocked = roomReducer(undefined, joinBlocked({ reason: 'participant_limit_reached' }));
    return roomReducer(blocked, connectionClosed({ errorCode: 1013 }));
  };

  const startRoomPending = (roomId: RoomId) => ({
    type: startRoom.pending.type,
    meta: { arg: { roomId } },
  });

  it('stays on the blocked screen while retrying instead of falling back to the lobby', () => {
    const retrying = roomReducer(blockedAndClosed(), startRoomPending('room-1' as RoomId));

    expect(retrying.connectionState).toBe(ConnectionState.Blocked);
  });

  it('enters the starting state on a regular join attempt', () => {
    const starting = roomReducer(undefined, startRoomPending('room-1' as RoomId));

    expect(starting.connectionState).toBe(ConnectionState.Starting);
  });

  it('leaves the blocked state once the retry succeeds', () => {
    const retrying = roomReducer(blockedAndClosed(), startRoomPending('room-1' as RoomId));
    const online = roomReducer(retrying, {
      type: joinSuccess.type,
      payload: { serverTimeOffset: 0, isRoomOwner: false, tariff: { quotas: {} } },
    });

    expect(online.connectionState).toBe(ConnectionState.Online);
  });
});

describe('roomSlice - setCanEnter (entry_permission_changed)', () => {
  const stateInLobby = (canEnter: boolean) =>
    roomReducer(
      undefined,
      joinedLobby({ canEnter, displayName: 'Alex', participantId: 'participant-1' as ParticipantId })
    );

  it('updates canEnter to false when entry permission is revoked', () => {
    const next = roomReducer(stateInLobby(true), setCanEnter(false));

    expect(next.canEnter).toBe(false);
  });

  it('keeps the connection state in the lobby while entry permission changes', () => {
    const next = roomReducer(stateInLobby(false), setCanEnter(true));

    expect(next.connectionState).toBe(ConnectionState.Lobby);
    expect(next.lobbyDisplayName).toBe('Alex');
  });
});

describe('roomSlice - joinedLobby', () => {
  it('stores the participant id delivered via joined_lobby', () => {
    const next = roomReducer(
      undefined,
      joinedLobby({ canEnter: false, displayName: 'Alex', participantId: 'participant-1' as ParticipantId })
    );

    expect(next.lobbyParticipantId).toBe('participant-1');
    expect(next.connectionState).toBe(ConnectionState.Lobby);
  });
});
