// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import log from '../../logger';
import type { RootState } from '../../store';
import { changeMedia } from '../../store/commonActions';
import {
  setLivekitPopoutStreamAccessToken,
  setNewAccessToken,
  triggerLivekitReconnect,
} from '../../store/slices/livekitSlice';
import * as mediaStore from '../../store/slices/mediaSlice';
import { forceMuteDisabled, forceMuteEnabled } from '../../store/slices/moderationSlice';
import type { ParticipantId } from '../../types';
import type { Message as LivekitMessage } from '../types/incoming/livekit';
import { handleLivekitMessage } from './livekit';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../commonComponents', () => ({
  notifications: {
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('../../store/commonActions', () => ({
  changeMedia: vi.fn((payload: { enabled: boolean; kind: string }) => ({
    type: 'livekit/changeMedia',
    payload,
  })),
}));

vi.mock('../../store/slices/mediaSlice', () => ({
  notificationShown: vi.fn(() => ({
    type: 'media/notificationShown',
  })),
}));

vi.mock('../../logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

const createState = (overrides: DeepPartial<RootState> = {}): RootState =>
  ({
    moderation: {
      forceMute: {
        unrestrictedParticipants: [],
      },
    },
    participants: {
      entities: {},
    },
    user: {
      uuid: 'user-1' as ParticipantId,
    },
    ...overrides,
  }) as RootState;

describe('handleLivekitMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enables force mute and notifies restricted users', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: LivekitMessage = {
      message: 'microphone_restrictions_enabled',
      unrestrictedParticipants: ['user-2' as ParticipantId],
    };

    handleLivekitMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(
      forceMuteEnabled({ unrestrictedParticipants: data.unrestrictedParticipants })
    );
    expect(i18next.t).toHaveBeenCalledWith('microphones-disabled-notification');
    expect(notifications.info).toHaveBeenCalledWith('microphones-disabled-notification');
  });

  it('disables force mute and notifies when restrictions are lifted', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: LivekitMessage = { message: 'microphone_restrictions_disabled' };

    handleLivekitMessage(dispatch, data, state);

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
    const data: LivekitMessage = { message: 'force_muted', moderator: moderatorId };

    handleLivekitMessage(dispatch, data, state);

    expect(i18next.t).toHaveBeenCalledWith('media-received-force-mute', { origin: 'Moderator' });
    expect(notifications.warning).toHaveBeenCalledWith('media-received-force-mute');
    expect(changeMedia).toHaveBeenCalledWith({ kind: 'audioinput', enabled: false });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'livekit/changeMedia',
      payload: { kind: 'audioinput', enabled: false },
    });
    expect(dispatch).toHaveBeenCalledWith(mediaStore.notificationShown());
  });

  it('stores popout stream access tokens', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: LivekitMessage = { message: 'popout_stream_access_token', token: 'token-1' };

    handleLivekitMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(setLivekitPopoutStreamAccessToken('token-1'));
  });

  it('stores refreshed credentials', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: LivekitMessage = {
      message: 'credentials',
      room: 'room-1',
      token: 'token-2',
      publicUrl: 'https://livekit.example',
    };

    handleLivekitMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(setNewAccessToken(data));
  });

  it('triggers reconnect on livekit_unavailable errors', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: LivekitMessage = { message: 'error', error: 'livekit_unavailable' };

    handleLivekitMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(triggerLivekitReconnect());
  });

  it('throws on unexpected error types', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'error', error: 'unknown_error' } as unknown as LivekitMessage;

    expect(() => handleLivekitMessage(dispatch, data, state)).toThrow(/Livekit Error/);
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Livekit Error'));
  });
});
