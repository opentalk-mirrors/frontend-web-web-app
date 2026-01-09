// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  StreamingKind,
  StreamingStatus,
  type StreamUpdatedMessage,
  type StreamingTargetEntity,
  type StreamingTargetId,
} from '@opentalk/rest-api-rtk-query';
import i18next from 'i18next';

import { notifications, showConsentNotification } from '../../commonComponents';
import { createStreamUpdatedNotification } from '../../components/StreamUpdatedNotification';
import log from '../../logger';
import type { RootState } from '../../store';
import { streamUpdated } from '../../store/slices/streamingSlice';
import type { Message as StreamingMessage } from '../types/incoming/streaming';
import { handleStreamingMessage } from './streaming';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../commonComponents', () => ({
  notifications: {
    error: vi.fn(),
  },
  showConsentNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../components/StreamUpdatedNotification', () => ({
  createStreamUpdatedNotification: vi.fn(),
}));

vi.mock('../../logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

const createState = (overrides: Partial<RootState> = {}) =>
  ({
    livekit: {
      mediaSettings: {
        cameraEnabled: true,
        microphoneEnabled: false,
      },
    },
    room: {
      eventInfo: {
        id: 'event-1',
      },
    },
    streaming: {
      consent: undefined,
      streams: {
        ids: [],
        entities: {},
      },
    },
    ...overrides,
  }) as RootState;

describe('handleStreamingMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches stream updates and requests consent for active streams', async () => {
    const dispatch = vi.fn();
    const targetId = 'stream-1' as StreamingTargetId;
    const data: StreamUpdatedMessage = {
      message: 'stream_updated',
      targetId,
      status: StreamingStatus.Active,
    };
    const streamTarget: StreamingTargetEntity = {
      targetId,
      status: StreamingStatus.Active,
      streamingKind: StreamingKind.Livestream,
      publicUrl: 'https://stream.example',
      name: 'Livestream 1',
    };
    const state = createState({
      streaming: {
        consent: undefined,
        streams: {
          ids: [targetId],
          entities: {
            [targetId]: streamTarget,
          },
        },
      },
    });

    await handleStreamingMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(streamUpdated(data));
    expect(createStreamUpdatedNotification).toHaveBeenCalledExactlyOnceWith({
      kind: StreamingKind.Livestream,
      status: StreamingStatus.Active,
      publicUrl: 'https://stream.example',
      eventId: 'event-1',
    });
    expect(showConsentNotification).toHaveBeenCalledExactlyOnceWith(dispatch);
  });

  it('skips consent notification when consent is already given', async () => {
    const dispatch = vi.fn();
    const targetId = 'stream-2' as StreamingTargetId;
    const data: StreamUpdatedMessage = {
      message: 'stream_updated',
      targetId,
      status: StreamingStatus.Active,
    };
    const state = createState({
      streaming: {
        consent: true,
        streams: {
          ids: [],
          entities: {},
        },
      },
    });

    await handleStreamingMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(streamUpdated(data));
    expect(createStreamUpdatedNotification).not.toHaveBeenCalled();
    expect(showConsentNotification).not.toHaveBeenCalled();
  });

  it('notifies on recorder timeouts', async () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: StreamingMessage = {
      message: 'recorder_error',
      error: 'timeout',
    } as StreamingMessage;

    await handleStreamingMessage(dispatch, data, state);

    expect(i18next.t).toHaveBeenCalledWith('livestream-recording-error');
    expect(notifications.error).toHaveBeenCalledWith('livestream-recording-error');
    expect(log.error).toHaveBeenCalledWith('recording error:', 'timeout');
  });

  it('throws on unknown message types', async () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'unknown' } as unknown as StreamingMessage;

    await expect(handleStreamingMessage(dispatch, data, state)).rejects.toThrow(/Unknown message type/);
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Unknown recording message type'));
  });
});
