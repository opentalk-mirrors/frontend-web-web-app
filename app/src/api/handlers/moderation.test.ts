// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import type { RootState } from '../../store';
import { disabledSelfRename, forceMuteDisabled, forceMuteEnabled } from '../../store/slices/moderationSlice';
import { enteredWaitingRoom } from '../../store/slices/roomSlice';
import { Role } from '../../types';
import type { ParticipantId, Timestamp } from '../../types';
import type { DisplayNameChanged, Message as ModerationMessage } from '../types/incoming/moderation';
import { participantRename } from './helpers';
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

describe('handleModerationMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches hangup and warning when kicked', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: ModerationMessage = { message: 'kicked' };

    handleModerationMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
    expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('meeting-notification-kicked');
  });

  it('moves participant to waiting room when instructed', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: ModerationMessage = { message: 'sent_to_waiting_room' };

    handleModerationMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(enteredWaitingRoom());
    expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('meeting-notification-moved-to-waiting-room');
  });

  it('updates display name when our user is renamed', () => {
    const dispatch = vi.fn();
    const userId = 'participant-1' as ParticipantId;
    const moderatorId = 'moderator-1' as ParticipantId;
    const data: DisplayNameChanged = {
      message: 'display_name_changed',
      target: userId,
      issuedBy: moderatorId,
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

    handleModerationMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenNthCalledWith(1, participantRename({ id: userId, newName: 'Jordan' }));
    expect(i18next.t).toHaveBeenCalledExactlyOnceWith('rename-other-target-notification', {
      actorName: 'Moderator',
      newName: 'Jordan',
    });
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('rename-other-target-notification');
  });

  it('enables force mute and notifies restricted users', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: ModerationMessage = {
      message: 'microphone_restrictions_enabled',
      unrestrictedParticipants: ['user-2' as ParticipantId],
    };

    handleModerationMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledWith(
      forceMuteEnabled({ unrestrictedParticipants: data.unrestrictedParticipants })
    );
    expect(i18next.t).toHaveBeenCalledWith('microphones-disabled-notification');
    expect(notifications.info).toHaveBeenCalledWith('microphones-disabled-notification');
  });

  it('disables force mute and notifies when restrictions are lifted', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: ModerationMessage = { message: 'microphone_restrictions_disabled' };

    handleModerationMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledWith(forceMuteDisabled());
    expect(i18next.t).toHaveBeenCalledWith('microphones-enabled-notification');
    expect(notifications.info).toHaveBeenCalledWith('microphones-enabled-notification');
  });

  it('handles force-muted notifications and disables audio', () => {
    const dispatch = vi.fn();
    const moderatorId = 'moderator-1' as ParticipantId;
    const state = createState({
      participants: {
        entities: {
          [moderatorId]: {
            displayName: 'Moderator',
          },
        },
      },
    });
    const data: ModerationMessage = { message: 'muted', moderator: moderatorId };

    handleModerationMessage(dispatch, data, timestamp, state);

    expect(i18next.t).toHaveBeenCalledWith('media-received-force-mute', { origin: 'Moderator' });
    expect(notifications.warning).toHaveBeenCalledWith('media-received-force-mute');
  });

  // it('notifies moderators when a debriefing session ends for all', () => {
  //   const dispatch = vi.fn();
  //   const state = createState({
  //     user: {
  //       role: Role.Moderator,
  //     },
  //   });
  //   const data: ModerationMessage = { message: 'session_ended' };

  //   handleModerationMessage(dispatch, data, timestamp, state);

  //   expect(dispatch).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
  //   expect(notifications.info).toHaveBeenCalledExactlyOnceWith('debriefing-session-ended-for-all-notification');
  // });

  it('notifies users when moderator enabled renaming', () => {
    const dispatch = vi.fn();
    const state = createState();
    const message: ModerationMessage = {
      message: 'display_name_change_restrictions_enabled',
    };
    handleModerationMessage(dispatch, message, timestamp, state);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(disabledSelfRename());
    expect(i18next.t).toHaveBeenCalledExactlyOnceWith('renaming-enabled-notification');
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('renaming-enabled-notification');
  });

  it('notifies users when moderator disabled renaming', () => {
    const dispatch = vi.fn();
    const state = createState();
    const message: ModerationMessage = {
      message: 'display_name_change_restrictions_disabled',
    };
    handleModerationMessage(dispatch, message, timestamp, state);
    expect(i18next.t).toHaveBeenCalledExactlyOnceWith('renaming-disabled-notification');
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('renaming-disabled-notification');
  });
});
