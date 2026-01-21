// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notificationAction } from '../../commonComponents';
import log from '../../logger';
import type { RootState } from '../../store';
import {
  inviteParticipants,
  removeParticipant,
  resetSubroomAudioData,
  setSubroomAudioData,
  updateParticipantInviteState,
} from '../../store/slices/subroomAudioSlice';
import type { ParticipantId, WhisperId } from '../../types';
import { WhisperParticipantState } from '../../types';
import type { Message as SubroomAudioMessage } from '../types/incoming/subroomAudio';
import { SubroomAudioError } from '../types/incoming/subroomAudio';
import { acceptWhisperInvite, declineWhisperInvite } from '../types/outgoing/subroomAudio';
import { handleSubroomAudioMessage } from './subroomAudio';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../i18n', () => ({
  default: {
    t: vi.fn(),
    changeLanguage: vi.fn(),
  },
}));

vi.mock('../../commonComponents', () => ({
  notificationAction: vi.fn(),
}));

vi.mock('../../logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

const createState = (overrides: DeepPartial<RootState> = {}): RootState =>
  ({
    participants: {
      entities: {},
    },
    subroomAudio: {
      whisperId: undefined,
      token: undefined,
      participants: [],
      isWhisperActive: false,
    },
    user: {
      uuid: 'user-1' as ParticipantId,
    },
    ...overrides,
  }) as RootState;

describe('handleSubroomAudioMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores subroom audio data when a whisper group is created', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: SubroomAudioMessage = {
      message: 'whisper_group_created',
      whisperId: 'whisper-1' as WhisperId,
      token: 'token-1',
      participants: [{ participantId: 'user-1' as ParticipantId, state: WhisperParticipantState.Invited }],
    };

    handleSubroomAudioMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(
      setSubroomAudioData({ whisperId: data.whisperId, token: data.token, participants: data.participants })
    );
  });

  it('declines invites when already in a whisper group', () => {
    const dispatch = vi.fn();
    const state = createState({
      subroomAudio: {
        whisperId: 'whisper-1' as WhisperId,
      },
    });
    const data: SubroomAudioMessage = {
      message: 'whisper_invite',
      whisperId: 'whisper-2' as WhisperId,
      participants: [],
      issuer: 'user-2' as ParticipantId,
    };

    handleSubroomAudioMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(declineWhisperInvite.action({ whisperId: data.whisperId }));
    expect(notificationAction).not.toHaveBeenCalled();
  });

  it('notifies on invites and wires accept/decline actions', () => {
    const dispatch = vi.fn();
    const issuerId = 'user-2' as ParticipantId;
    const state = createState({
      participants: {
        entities: {
          [issuerId]: {
            displayName: 'Inviter',
          },
        },
      },
    });
    const data: SubroomAudioMessage = {
      message: 'whisper_invite',
      whisperId: 'whisper-1' as WhisperId,
      participants: [{ participantId: 'user-1' as ParticipantId, state: WhisperParticipantState.Invited }],
      issuer: issuerId,
    };

    handleSubroomAudioMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(
      setSubroomAudioData({ whisperId: data.whisperId, participants: data.participants })
    );
    expect(i18next.t).toHaveBeenCalledWith('whisper-invite-notification', { displayName: 'Inviter' });
    expect(notificationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'whisper-invite-notification',
        variant: 'info',
        ariaLive: 'polite',
        actionBtnText: 'global-accept',
        cancelBtnText: 'global-decline',
        persist: true,
      })
    );

    const notificationArgs = vi.mocked(notificationAction).mock.calls[0]?.[0];
    notificationArgs?.onAction?.();
    notificationArgs?.onCancel?.();

    expect(dispatch).toHaveBeenCalledWith(acceptWhisperInvite.action({ whisperId: data.whisperId }));
    expect(dispatch).toHaveBeenCalledWith(declineWhisperInvite.action({ whisperId: data.whisperId }));
    expect(dispatch).toHaveBeenCalledWith(resetSubroomAudioData());
  });

  it('marks the local participant as accepted on whisper_token', () => {
    const dispatch = vi.fn();
    const state = createState({
      subroomAudio: {
        participants: [
          { participantId: 'user-1' as ParticipantId, state: WhisperParticipantState.Invited },
          { participantId: 'user-2' as ParticipantId, state: WhisperParticipantState.Invited },
        ],
      },
    });
    const data: SubroomAudioMessage = {
      message: 'whisper_token',
      whisperId: 'whisper-1' as WhisperId,
      token: 'token-2',
    };

    handleSubroomAudioMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(
      setSubroomAudioData({
        whisperId: data.whisperId,
        token: data.token,
        participants: [
          { participantId: 'user-1' as ParticipantId, state: WhisperParticipantState.Accepted },
          { participantId: 'user-2' as ParticipantId, state: WhisperParticipantState.Invited },
        ],
      })
    );
  });

  it('updates invite state for accepted participants', () => {
    const dispatch = vi.fn();
    const participantId = 'user-2' as ParticipantId;
    const state = createState({
      participants: {
        entities: {
          [participantId]: {
            displayName: 'Invitee',
          },
        },
      },
    });
    const data: SubroomAudioMessage = {
      message: 'whisper_invite_accepted',
      whisperId: 'whisper-1' as WhisperId,
      participantId,
    };

    handleSubroomAudioMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(
      updateParticipantInviteState({ participantId, participantState: WhisperParticipantState.Accepted })
    );
    expect(notificationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'whisper-invite-accept-notification',
        variant: 'info',
        ariaLive: 'polite',
      })
    );
  });

  it('removes participants on decline and leaving', () => {
    const dispatch = vi.fn();
    const participantId = 'user-2' as ParticipantId;
    const state = createState({
      participants: {
        entities: {
          [participantId]: {
            displayName: 'Invitee',
          },
        },
      },
    });
    const declined: SubroomAudioMessage = {
      message: 'whisper_invite_declined',
      whisperId: 'whisper-1' as WhisperId,
      participantId,
    };
    const left: SubroomAudioMessage = {
      message: 'left_whisper_group',
      whisperId: 'whisper-1' as WhisperId,
      participantId: 'user-3' as ParticipantId,
    };

    handleSubroomAudioMessage(dispatch, declined, state);
    handleSubroomAudioMessage(dispatch, left, state);

    expect(dispatch).toHaveBeenCalledWith(removeParticipant({ participantId }));
    expect(dispatch).toHaveBeenCalledWith(removeParticipant({ participantId: 'user-3' as ParticipantId }));
    expect(notificationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'whisper-invite-decline-notification',
        variant: 'error',
        ariaLive: 'assertive',
      })
    );
  });

  it('invites participants when instructed', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: SubroomAudioMessage = {
      message: 'participants_invited',
      whisperId: 'whisper-1' as WhisperId,
      participantIds: ['user-2' as ParticipantId],
    };

    handleSubroomAudioMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(inviteParticipants({ participants: data.participantIds }));
  });

  it('throws on error messages', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: SubroomAudioMessage = { message: 'error', error: SubroomAudioError.InvalidWhisperId };

    expect(() => handleSubroomAudioMessage(dispatch, data, state)).toThrow('Subroom Audio Error: invalid_whisper_id');
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Subroom Audio Error'));
  });

  it('logs unknown message types', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'unknown' } as unknown as SubroomAudioMessage;

    expect(() => handleSubroomAudioMessage(dispatch, data, state)).not.toThrow();
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Unknown subroom audio message type'));
  });
});
