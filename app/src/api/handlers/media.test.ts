// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notificationPersistent, notifications } from '../../commonComponents';
import i18n from '../../i18n';
import log from '../../logger';
import type { RootState } from '../../store';
import { MediaSessionType, ParticipantId } from '../../types';
import type { MediaError, Message as MediaMessage, PresenterRoleGranted } from '../types/incoming/media';
import { handleMediaMessage } from './media';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../i18n', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../commonComponents', () => ({
  notificationPersistent: vi.fn(),
  notifications: {
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

const createState = (overrides: Partial<RootState> = {}) =>
  ({
    participants: {
      ids: ['user-1' as ParticipantId],
      entities: {
        'user-1': {
          displayName: 'Presenter',
        },
      },
    },
    ...overrides,
  }) as RootState;

const createMediaError = (error: string): MediaError =>
  ({
    message: 'error',
    error,
    text: 'error text',
    source: 'user-1' as ParticipantId,
    mediaSessionType: 'camera' as MediaSessionType,
  }) as MediaError;

describe('handleMediaMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('notifies when a presenter role is granted', async () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: PresenterRoleGranted = {
      message: 'presenter_role_granted',
      participantIds: ['user-1' as ParticipantId],
    };

    await handleMediaMessage(dispatch, data, state);

    expect(i18n.t).toHaveBeenCalledWith('presenter-role-granted', { displayName: 'Presenter' });
    expect(notifications.info).toHaveBeenCalledWith('presenter-role-granted');
  });

  it('notifies when a presenter role is revoked', async () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: MediaMessage = {
      message: 'presenter_role_revoked',
      participantIds: ['user-1' as ParticipantId],
    };

    await handleMediaMessage(dispatch, data, state);

    expect(i18n.t).toHaveBeenCalledWith('presenter-role-revoked', { displayName: 'Presenter' });
    expect(notifications.warning).toHaveBeenCalledWith('presenter-role-revoked');
  });

  it('shows a persistent notification for invalid_end_of_candidates', async () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = createMediaError('invalid_end_of_candidates');

    await handleMediaMessage(dispatch, data, state);

    expect(i18next.t).toHaveBeenCalledWith('media-ice-connection-not-possible');
    expect(notificationPersistent).toHaveBeenCalledWith({
      msg: 'media-ice-connection-not-possible',
      variant: 'error',
      ariaLive: 'assertive',
    });
  });

  it('throws and notifies on media errors', async () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = createMediaError('invalid_candidate');

    await expect(handleMediaMessage(dispatch, data, state)).rejects.toThrow('Media Error: invalid_candidate');

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Media Error:'));
    expect(notifications.error).toHaveBeenCalledWith('error-general');
  });

  it('throws for unexpected errors', async () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = createMediaError('unexpected_error');

    await expect(handleMediaMessage(dispatch, data, state)).rejects.toThrow('Media Error: unexpected_error');

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Media Error:'));
    expect(notifications.error).not.toHaveBeenCalled();
  });
});
