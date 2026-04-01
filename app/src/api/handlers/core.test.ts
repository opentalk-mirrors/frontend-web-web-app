// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../store';
import { waitingRoomJoined } from '../../store/slices/participantsSlice';
import { Role } from '../../types';
import type { ParticipantId, Timestamp } from '../../types';
import { JoinedWaitingRoom } from '../types/incoming/core';
import { handleRoomServerCoreMessage } from './core';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
  },
}));

vi.mock('../../commonComponents', () => ({
  notifications: {
    info: vi.fn(),
    warning: vi.fn(),
  },
  setLibravatarOptions: vi.fn(() => 'mocked-avatar'),
}));

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

const createState = (overrides: DeepPartial<RootState> = {}): RootState =>
  ({
    moderation: {
      forceMute: {
        unrestrictedParticipants: [],
      },
    },
    config: {
      libravatarDefaultImage: 'robohash',
    },
    participants: {
      entities: {},
    },
    user: {
      uuid: 'participant-1',
      role: Role.User,
    },
    ...overrides,
  }) as RootState;

const timestamp = '2024-01-01T12:00:00Z' as Timestamp;

describe('handleRoomServerCoreMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps waiting room participant avatar before dispatching', () => {
    const dispatch = vi.fn();
    const state = createState();
    const participantId = 'participant-2' as ParticipantId;
    const data: JoinedWaitingRoom = {
      message: 'joined_waiting_room',
      participantId,
      connectionIds: [],
      joinedAt: '2024-01-01T10:00:00Z' as Timestamp,
      displayName: 'Alex',
    };

    handleRoomServerCoreMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      waitingRoomJoined({
        ...data,
      })
    );
  });
});
