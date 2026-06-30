// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import type { RootState } from '../../store';
import {
  disabledSelfRename,
  enabledSelfRename,
  forceMuteDisabled,
  forceMuteEnabled,
  setDebriefingStarted,
  setModeratorData,
  setWaitingRoomState,
} from '../../store/slices/moderationSlice';
import { rename } from '../../store/slices/participantsSlice';
import { enteredWaitingRoom } from '../../store/slices/roomSlice';
import { setDisplayName, updateRole } from '../../store/slices/userSlice';
import { Role, WaitingRoom } from '../../types';
import type { ModeratorJoinInfo, ParticipantId, Timestamp } from '../../types';
import { KickReason } from '../../types';
import type { DisplayNameChanged, Message as ModerationMessage, RoleUpdated } from '../types/incoming/moderation';
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
    const data: ModerationMessage = { message: 'kicked', reason: KickReason.Kicked };

    handleModerationMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
    expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('meeting-notification-kicked');
  });

  it('dispatches hangup and warning when debriefed', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: ModerationMessage = { message: 'kicked', reason: KickReason.Debriefed };

    handleModerationMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('debriefing-session-ended-notification');
  });

  it('moves participant to waiting room when instructed', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: ModerationMessage = { message: 'sent_to_waiting_room' };

    handleModerationMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(enteredWaitingRoom());
    expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('meeting-notification-moved-to-waiting-room');
  });

  it('updates display name when other user is renamed', () => {
    const dispatch = vi.fn();
    const userId = 'participant-1' as ParticipantId;
    const otherUserId = 'participant-2' as ParticipantId;
    const moderatorId = 'moderator-1' as ParticipantId;
    const data: DisplayNameChanged = {
      message: 'display_name_changed',
      target: otherUserId,
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
    expect(dispatch).toHaveBeenNthCalledWith(1, rename({ id: otherUserId, displayName: 'Jordan' }));
    expect(i18next.t).toHaveBeenCalledWith('rename-general-notification', {
      actorName: 'Moderator',
      newName: 'Jordan',
      oldName: 'Alex',
    });
    expect(notifications.info).toHaveBeenCalledWith('rename-general-notification');
  });

  it('updates display name when we rename ourselves', () => {
    const dispatch = vi.fn();
    const userId = 'participant-1' as ParticipantId;
    const data: DisplayNameChanged = {
      message: 'display_name_changed',
      target: userId,
      issuedBy: userId,
      oldName: 'Alex',
      newName: 'Jordan',
    };
    const state = createState({
      user: {
        uuid: userId,
      },
    });

    handleModerationMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(1, rename({ id: userId, displayName: 'Jordan' }));
    expect(dispatch).toHaveBeenNthCalledWith(2, setDisplayName('Jordan'));
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

  it('notifies users and enables self-rename when moderator enabled renaming', () => {
    const dispatch = vi.fn();
    const state = createState();
    const message: ModerationMessage = {
      message: 'display_name_change_restrictions_disabled',
    };
    handleModerationMessage(dispatch, message, timestamp, state);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(enabledSelfRename());
    expect(i18next.t).toHaveBeenCalledExactlyOnceWith('renaming-enabled-notification');
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('renaming-enabled-notification');
  });

  it('notifies users and disables self-rename when moderator disabled renaming', () => {
    const dispatch = vi.fn();
    const state = createState();
    const message: ModerationMessage = {
      message: 'display_name_change_restrictions_enabled',
    };
    handleModerationMessage(dispatch, message, timestamp, state);
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(disabledSelfRename());
    expect(i18next.t).toHaveBeenCalledExactlyOnceWith('renaming-disabled-notification');
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('renaming-disabled-notification');
  });

  describe('role_updated', () => {
    const moderatorData: ModeratorJoinInfo = {
      raiseHandsEnabled: true,
      guestAccess: false,
      waitingRoomParticipants: [],
      waitingRoom: WaitingRoom.ForEveryone,
    };

    it('consumes moderator data when the local user is promoted to moderator', () => {
      const dispatch = vi.fn();
      const userId = 'participant-1' as ParticipantId;
      const state = createState({ user: { uuid: userId } });
      const data: RoleUpdated = {
        message: 'role_updated',
        participantId: userId,
        newRole: Role.Moderator,
        moderatorData,
      };

      handleModerationMessage(dispatch, data, timestamp, state);

      expect(dispatch).toHaveBeenCalledWith(updateRole(Role.Moderator));
      expect(dispatch).toHaveBeenCalledWith(setModeratorData({ moderatorData }));
      expect(notifications.info).toHaveBeenCalledExactlyOnceWith('moderation-rights-granted');
    });

    it('consumes moderator data for another participant carrying moderator data', () => {
      const dispatch = vi.fn();
      const userId = 'participant-1' as ParticipantId;
      const otherUserId = 'participant-2' as ParticipantId;
      const state = createState({ user: { uuid: userId } });
      const data: RoleUpdated = {
        message: 'role_updated',
        participantId: otherUserId,
        newRole: Role.Moderator,
        moderatorData,
      };

      handleModerationMessage(dispatch, data, timestamp, state);

      expect(dispatch).toHaveBeenCalledWith(setModeratorData({ moderatorData }));
    });

    it('does not dispatch moderator data when it is absent', () => {
      const dispatch = vi.fn();
      const userId = 'participant-1' as ParticipantId;
      const state = createState({ user: { uuid: userId } });
      const data: RoleUpdated = {
        message: 'role_updated',
        participantId: userId,
        newRole: Role.User,
      };

      handleModerationMessage(dispatch, data, timestamp, state);

      expect(dispatch).not.toHaveBeenCalledWith(setModeratorData(expect.anything()));
      expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('moderation-rights-revoked');
    });
  });

  describe('waiting room notifications during debriefing', () => {
    it('notifies about a manual waiting room change', () => {
      const dispatch = vi.fn();
      const state = createState({ moderation: { debriefingStarted: false } });
      const data: ModerationMessage = { message: 'waiting_room_updated', newState: WaitingRoom.ForGuests };

      handleModerationMessage(dispatch, data, timestamp, state);

      expect(dispatch).toHaveBeenCalledExactlyOnceWith(setWaitingRoomState(WaitingRoom.ForGuests));
      expect(notifications.info).toHaveBeenCalledExactlyOnceWith('waiting-room-for-guests-message');
    });

    it('flags debriefing so the follow-up waiting room notification can be suppressed', () => {
      const dispatch = vi.fn();
      const state = createState();
      const data: ModerationMessage = { message: 'debriefing_started', issuedBy: 'participant' as ParticipantId };

      handleModerationMessage(dispatch, data, timestamp, state);

      expect(dispatch).toHaveBeenCalledExactlyOnceWith(setDebriefingStarted(true));
      expect(notifications.info).toHaveBeenCalledExactlyOnceWith('debriefing-started-notification');
    });

    it('suppresses and consumes the redundant waiting room notification that follows debriefing', () => {
      const dispatch = vi.fn();
      const state = createState({ moderation: { debriefingStarted: true } });
      const data: ModerationMessage = { message: 'waiting_room_updated', newState: WaitingRoom.ForEveryone };

      handleModerationMessage(dispatch, data, timestamp, state);

      expect(dispatch).toHaveBeenCalledWith(setWaitingRoomState(WaitingRoom.ForEveryone));
      expect(dispatch).toHaveBeenCalledWith(setDebriefingStarted(false));
      expect(notifications.info).not.toHaveBeenCalled();
    });
  });
});
