// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { setLibravatarOptions } from '../../commonComponents';
import type { RootState } from '../../store';
import * as breakoutStore from '../../store/slices/breakoutSlice';
import { breakoutJoined, breakoutLeft } from '../../store/slices/participantsSlice';
import { BreakoutRoomId, ParticipantId, ParticipationKind, Timestamp } from '../../types';
import { BreakoutError } from '../types/incoming/breakout';
import type {
  Joined as BreakoutJoinedMessage,
  Left as BreakoutLeftMessage,
  Message as BreakoutMessage,
  Started as BreakoutStartedMessage,
} from '../types/incoming/breakout';
import { handleBreakoutMessage } from './breakout';
import { showErrorNotification } from './helpers';

vi.mock('../../commonComponents', () => ({
  setLibravatarOptions: vi.fn(() => 'mocked-avatar'),
}));

vi.mock('./helpers', () => ({
  showErrorNotification: vi.fn(),
}));

const createState = (overrides: Partial<RootState> = {}) =>
  ({
    config: {
      libravatarDefaultImage: 'robohash',
    },
    ...overrides,
  }) as RootState;

const createStartedMessage = (): BreakoutStartedMessage => ({
  message: 'started',
  rooms: [{ id: 'room-1' as BreakoutRoomId, name: 'Room 1' }],
  assignment: null,
  expires: '2024-01-01T10:00:00Z',
});

describe('handleBreakoutMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches started events', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = createStartedMessage();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;

    handleBreakoutMessage(dispatch, state, data, timestamp);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(breakoutStore.started(data));
  });

  it('updates participant data when joining breakout', () => {
    const dispatch = vi.fn();
    const state = createState();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;
    const data: BreakoutJoinedMessage = {
      message: 'joined',
      breakoutRoom: 'room-2' as BreakoutRoomId,
      id: 'participant-1' as ParticipantId,
      displayName: 'Alex',
      avatarUrl: 'https://avatar.example',
      leftAt: null,
      participationKind: ParticipationKind.User,
    };

    handleBreakoutMessage(dispatch, state, data, timestamp);

    expect(setLibravatarOptions).toHaveBeenCalledExactlyOnceWith(data.avatarUrl, {
      defaultImage: state.config.libravatarDefaultImage,
    });
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      breakoutJoined({
        data: {
          ...data,
          avatarUrl: 'mocked-avatar',
        },
        timestamp,
      })
    );
  });

  it('dispatches left events', () => {
    const dispatch = vi.fn();
    const state = createState();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;
    const data: BreakoutLeftMessage = {
      message: 'left',
      breakoutRoom: null,
      id: 'participant-2' as ParticipantId,
    };

    handleBreakoutMessage(dispatch, state, data, timestamp);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(breakoutLeft({ id: data.id, timestamp }));
  });

  it('reports errors through the helper', () => {
    const dispatch = vi.fn();
    const state = createState();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;
    const data: BreakoutMessage = { message: 'error', error: BreakoutError.InsufficientPermissions };

    handleBreakoutMessage(dispatch, state, data, timestamp);

    expect(showErrorNotification).toHaveBeenCalledExactlyOnceWith(BreakoutError.InsufficientPermissions);
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const state = createState();
    const timestamp = '2024-01-01T10:00:00Z' as Timestamp;
    const data = { message: 'unknown' } as unknown as BreakoutMessage;

    expect(() => handleBreakoutMessage(dispatch, state, data, timestamp)).toThrow(/Unknown message type/);
  });
});
