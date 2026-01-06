// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications, setLibravatarOptions } from '../../commonComponents';
import type { RootState } from '../../store';
import { waitingRoomJoined, rename as participantsRename } from '../../store/slices/participantsSlice';
import { enteredWaitingRoom } from '../../store/slices/roomSlice';
import { setDisplayName } from '../../store/slices/userSlice';
import { ForceMuteType, ParticipationKind, Role } from '../../types';
import type { BackendParticipant, ParticipantId } from '../../types';
import type { DisplayNameChanged, JoinedWaitingRoom, Message as ModerationMessage } from '../types/incoming/moderation';
import { handleModerationMessage } from './moderation';

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

const createBackendParticipant = (id: ParticipantId): BackendParticipant =>
  ({
    id,
    control: {
      displayName: 'Alex',
      avatarUrl: 'https://avatar.example',
      handIsUp: false,
      joinedAt: '2024-01-01T10:00:00Z',
      leftAt: null,
      handUpdatedAt: '2024-01-01T10:00:00Z',
      participationKind: ParticipationKind.User,
      isRoomOwner: true,
    },
    meetingNotes: {
      readonly: false,
    },
    media: {
      forceMute: {
        type: ForceMuteType.Disabled,
        unrestrictedParticipants: [],
      },
    },
  }) as BackendParticipant;

describe('handleModerationMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches hangup and warning when kicked', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: ModerationMessage = { message: 'kicked' };

    handleModerationMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
    expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('meeting-notification-kicked');
  });

  it('moves participant to waiting room when instructed', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: ModerationMessage = { message: 'sent_to_waiting_room' };

    handleModerationMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(enteredWaitingRoom());
    expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('meeting-notification-moved-to-waiting-room');
  });

  it('maps waiting room participant avatar before dispatching', () => {
    const dispatch = vi.fn();
    const state = createState();
    const participantId = 'participant-2' as ParticipantId;
    const participant = createBackendParticipant(participantId);
    const data: JoinedWaitingRoom = { ...participant, message: 'joined_waiting_room' };

    handleModerationMessage(dispatch, data, state);

    expect(setLibravatarOptions).toHaveBeenCalledExactlyOnceWith(participant.control.avatarUrl, {
      defaultImage: state.config.libravatarDefaultImage,
    });
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      waitingRoomJoined({
        ...data,
        control: {
          ...data.control,
          avatarUrl: 'mocked-avatar',
        },
      })
    );
  });

  it('updates display name when our user is renamed', () => {
    const dispatch = vi.fn();
    const userId = 'participant-1' as ParticipantId;
    const moderatorId = 'moderator-1' as ParticipantId;
    const data: DisplayNameChanged = {
      message: 'display_name_changed',
      target: userId,
      issued_by: moderatorId,
      oldName: 'Alex',
      newName: 'Jordan',
    };
    const state = createState({
      user: {
        uuid: userId,
      },
      participants: {
        entities: {
          [moderatorId]: {
            displayName: 'Moderator',
          },
        },
      },
    });

    handleModerationMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(1, participantsRename({ id: userId, displayName: 'Jordan' }));
    expect(dispatch).toHaveBeenNthCalledWith(2, setDisplayName('Jordan'));
    expect(i18next.t).toHaveBeenCalledExactlyOnceWith('display-name-change-notification', {
      moderatorName: 'Moderator',
      oldName: 'Alex',
      newName: 'Jordan',
    });
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('display-name-change-notification');
  });

  it('notifies moderators when a debriefing session ends for all', () => {
    const dispatch = vi.fn();
    const state = createState({
      user: {
        role: Role.Moderator,
      },
    });
    const data: ModerationMessage = { message: 'session_ended' };

    handleModerationMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('debriefing-session-ended-for-all-notification');
  });
});
