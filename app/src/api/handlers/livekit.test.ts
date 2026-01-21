// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import {
  setLivekitPopoutStreamAccessToken,
  setNewAccessToken,
  triggerLivekitReconnect,
} from '../../store/slices/livekitSlice';
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

describe('handleLivekitMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores popout stream access tokens', () => {
    const dispatch = vi.fn();
    const data: LivekitMessage = { message: 'popout_stream_access_token', token: 'token-1' };

    handleLivekitMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledWith(setLivekitPopoutStreamAccessToken('token-1'));
  });

  it('stores refreshed credentials', () => {
    const dispatch = vi.fn();
    const data: LivekitMessage = {
      message: 'credentials',
      room: 'room-1',
      token: 'token-2',
      publicUrl: 'https://livekit.example',
    };

    handleLivekitMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledWith(setNewAccessToken(data));
  });

  it('triggers reconnect on livekit_unavailable errors', () => {
    const dispatch = vi.fn();
    const data: LivekitMessage = { message: 'error', error: 'livekit_unavailable' };

    handleLivekitMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledWith(triggerLivekitReconnect());
  });

  it('throws on unexpected error types', () => {
    const dispatch = vi.fn();
    const data = { message: 'error', error: 'unknown_error' } as unknown as LivekitMessage;

    expect(() => handleLivekitMessage(dispatch, data)).toThrow(/Livekit Error/);
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Livekit Error'));
  });
});
