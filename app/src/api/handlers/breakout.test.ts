// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import * as breakoutStore from '../../store/slices/breakoutSlice';
import { patch } from '../../store/slices/participantsSlice';
import { BreakoutRoomId, ParticipantId, RoomKind, Timestamp } from '../../types';
import { BreakoutError } from '../types/incoming/breakout';
import type {
  Message as BreakoutMessage,
  Started as BreakoutStartedMessage,
  ParticipantSwitchedRoom,
  SwitchedRoom,
  Closing,
  Closed,
} from '../types/incoming/breakout';
import { handleBreakoutMessage } from './breakout';
import { showErrorNotification } from './helpers';

vi.mock('./helpers', () => ({
  showErrorNotification: vi.fn(),
}));

const createStartedMessage = (): BreakoutStartedMessage => ({
  message: 'started',
  startedBy: 'participant-1' as ParticipantId,
  rooms: [{ id: 1 as BreakoutRoomId, name: 'Room 1' }],
  assignment: undefined,
  expiresAt: '2024-01-01T10:00:00Z' as Timestamp,
});

describe('handleBreakoutMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches started events', () => {
    const dispatch = vi.fn();
    const data = createStartedMessage();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;

    handleBreakoutMessage(dispatch, data, timestamp);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(breakoutStore.started(data));
  });

  it('updates participant lastActive and breakoutRoomId on participant_switched_room', () => {
    const dispatch = vi.fn();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;
    const data: ParticipantSwitchedRoom = {
      message: 'participant_switched_room',
      participantId: 'participant-1' as ParticipantId,
      oldRoom: {
        kind: RoomKind.Main,
      },
      newRoom: {
        kind: RoomKind.Breakout,
        id: 2 as BreakoutRoomId,
      },
      moduleData: undefined,
    };

    handleBreakoutMessage(dispatch, data, timestamp);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      patch({
        participantId: data.participantId,
        lastActive: timestamp,
        breakoutRoomId: data.newRoom.id,
      })
    );
  });

  it('dispatches switched_room to breakout store', () => {
    const dispatch = vi.fn();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;
    const data: SwitchedRoom = {
      message: 'switched_room',
      oldRoom: {
        kind: RoomKind.Main,
      },
      newRoom: {
        kind: RoomKind.Breakout,
        id: 3 as BreakoutRoomId,
      },
      ownData: undefined,
      peerData: undefined,
    };

    handleBreakoutMessage(dispatch, data, timestamp);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(breakoutStore.switchedRoom(data));
  });

  it('sets loading when closing', () => {
    const dispatch = vi.fn();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;
    const data: Closing = {
      message: 'closing',
      issuedBy: 'participant-9' as ParticipantId,
    };

    handleBreakoutMessage(dispatch, data, timestamp);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(breakoutStore.closing(data));
  });

  it('dispatches closed events', () => {
    const dispatch = vi.fn();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;
    const data: Closed = {
      message: 'closed',
    };

    handleBreakoutMessage(dispatch, data, timestamp);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(breakoutStore.closed(data));
  });

  it('reports errors through the helper', () => {
    const dispatch = vi.fn();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;
    const data: BreakoutMessage = { message: 'error', error: BreakoutError.InsufficientPermission };

    handleBreakoutMessage(dispatch, data, timestamp);

    expect(showErrorNotification).toHaveBeenCalledExactlyOnceWith(BreakoutError.InsufficientPermission);
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;
    const data = { message: 'unknown' } as unknown as BreakoutMessage;

    expect(() => handleBreakoutMessage(dispatch, data, timestamp)).toThrow(/Unknown message type/);
  });
});
