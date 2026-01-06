// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { SharedFolderData, Tariff } from '@opentalk/rest-api-rtk-query';

import { notifications } from '../../commonComponents';
import type { ConferenceRoom } from '../../modules/WebRTC';
import type { RootState } from '../../store';
import type { AppDispatch } from '../../store';
import { setChatSettings } from '../../store/slices/chatSlice';
import { update as participantsUpdate } from '../../store/slices/participantsSlice';
import { updateRole } from '../../store/slices/userSlice';
import type {
  BackendParticipant,
  GroupId,
  InitialPoll,
  JoinSuccessIncoming,
  Participant,
  ParticipantId,
  PollId,
  Timestamp,
} from '../../types';
import { ForceMuteType, MeetingNotesAccess, ParticipationKind, Role as CommonRole } from '../../types';
import type { control } from '../types/incoming';
import { Role } from '../types/incoming/control';
import { handleControlMessage } from './control';
import * as helpers from './helpers';

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

vi.mock('../../i18n', () => ({
  default: {
    t: (key: string) => key,
  },
}));

vi.mock('../../commonComponents', () => ({
  createStackedMessages: vi.fn(),
  notificationAction: vi.fn(),
  notifications: {
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  setLibravatarOptions: vi.fn(() => 'mocked-avatar'),
  showConsentNotification: vi.fn().mockResolvedValue(undefined),
  startTimeLimitNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../components/StreamUpdatedNotification', () => ({
  createStreamUpdatedNotification: vi.fn(),
}));

const createState = (overrides: Partial<RootState> = {}) =>
  ({
    config: {
      libravatarDefaultImage: 'robohash',
      provider: {
        accountManagementUrl: 'https://account.example',
      },
    },
    participants: {
      entities: {},
    },
    room: {
      participantLimit: 5,
    },
    streaming: {
      consent: undefined,
    },
    user: {
      isTariffUpgradable: true,
      role: CommonRole.User,
      uuid: 'user-1',
    },
    ...overrides,
  }) as RootState;

const createBackendParticipant = (): BackendParticipant =>
  ({
    id: 'participant-1' as ParticipantId,
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

const createJoinSuccessMessage = (overrides: Partial<JoinSuccessIncoming> = {}): JoinSuccessIncoming => ({
  message: 'join_success',
  id: 'participant-1' as ParticipantId,
  role: CommonRole.User,
  avatarUrl: 'https://avatar.example',
  assetStorage: {
    usedStorage: 95,
  },
  participants: [createBackendParticipant()],
  chat: {
    enabled: false,
    groups: [],
    groupsHistory: [
      {
        id: 'group-1',
        name: 'group-1' as GroupId,
        history: {
          messages: [],
          nextIndex: null,
        },
      },
    ],
    privateHistory: [],
    roomHistory: {
      messages: [],
      nextIndex: null,
    },
  },
  polls: {
    id: 'poll-1' as PollId,
    topic: 'Topic',
    live: false,
    multipleChoice: false,
    duration: 0 as InitialPoll['duration'],
    started: '2024-01-01T10:00:00Z',
    choices: [],
  } as InitialPoll,
  legalVote: {},
  moderation: {
    raiseHandsEnabled: false,
    waitingRoomEnabled: false,
    waitingRoomParticipants: [],
  },
  tariff: {
    id: 'tariff-1' as Tariff['id'],
    name: 'Test Tariff',
    quotas: {
      maxStorage: 100,
      roomParticipantLimit: 10,
    },
    modules: {},
  },
  closesAt: '' as Timestamp,
  sharedFolder: {
    read: {
      url: 'https://shared-folder.example',
      password: 'secret',
    },
  } as SharedFolderData,
  isRoomOwner: false,
  livekit: {
    room: 'room',
    token: 'token',
    publicUrl: 'url',
  },
  ...overrides,
});

describe('handleControlMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches chat settings and storage notification on join_success', async () => {
    const dispatch = vi.fn() as unknown as AppDispatch;
    const state = createState();
    const conference = { roomCredentials: { breakoutRoomId: null } } as ConferenceRoom;
    const timestamp = '2024-01-01T12:00:00Z' as Timestamp;
    const message = createJoinSuccessMessage();
    const storageSpy = vi.spyOn(helpers, 'showStorageNotification').mockImplementation(() => {});

    await handleControlMessage(dispatch, state, conference, message, timestamp);

    expect(storageSpy).toHaveBeenCalledExactlyOnceWith(state, 'warning');
    expect(dispatch).toHaveBeenCalledWith(setChatSettings({ id: message.id, timestamp, enabled: false }));
  });

  it('dispatches participant updates with meeting notes access', async () => {
    const dispatch = vi.fn() as unknown as AppDispatch;
    const state = createState();
    const conference = { roomCredentials: { breakoutRoomId: null } } as ConferenceRoom;
    const timestamp = '2024-01-01T12:00:00Z' as Timestamp;
    const message: control.Message = {
      message: 'update',
      id: 'participant-2' as ParticipantId,
      control: {
        displayName: 'Sam',
        handIsUp: false,
        joinedAt: '2024-01-01T10:00:00Z',
        leftAt: null,
        handUpdatedAt: '2024-01-01T10:00:00Z',
        participationKind: ParticipationKind.Guest,
        isRoomOwner: false,
      },
      meetingNotes: {
        readonly: true,
      },
      media: {
        forceMute: {
          type: ForceMuteType.Disabled,
          unrestrictedParticipants: [],
        },
      },
    };

    await handleControlMessage(dispatch, state, conference, message, timestamp);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: participantsUpdate.type,
        payload: expect.objectContaining({
          id: message.id,
          lastActive: timestamp,
          meetingNotesAccess: MeetingNotesAccess.Read,
        }),
      })
    );
  });

  it('notifies when role updates are received', async () => {
    const dispatch = vi.fn() as unknown as AppDispatch;
    const state = createState();
    const conference = { roomCredentials: { breakoutRoomId: null } } as ConferenceRoom;
    const timestamp = '2024-01-01T12:00:00Z' as Timestamp;
    const message: control.Message = {
      message: 'role_updated',
      newRole: Role.Moderator,
    };

    await handleControlMessage(dispatch, state, conference, message, timestamp);

    expect(dispatch).toHaveBeenCalledWith(updateRole(CommonRole.Moderator));
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('moderation-rights-granted');
  });

  it('shows a notification when moderator role is granted', async () => {
    const dispatch = vi.fn() as unknown as AppDispatch;
    const participantId = 'participant-3' as ParticipantId;
    const state = createState({
      participants: {
        entities: {
          [participantId]: {
            displayName: 'Pat',
          } as Participant,
        } as Record<ParticipantId, Participant>,
      } as RootState['participants'],
    });
    const conference = { roomCredentials: { breakoutRoomId: null } } as ConferenceRoom;
    const timestamp = '2024-01-01T12:00:00Z' as Timestamp;
    const message: control.Message = {
      message: 'moderator_role_granted',
      target: 'participant-3' as ParticipantId,
    };

    await handleControlMessage(dispatch, state, conference, message, timestamp);

    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('moderator-role-granted');
  });
});
