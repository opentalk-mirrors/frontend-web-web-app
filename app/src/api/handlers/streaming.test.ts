// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  StreamingStatus,
  StreamStatus,
  type StreamUpdatedMessage,
  type StreamingTargetEntity,
  type StreamingTargetId,
  StreamErrorReason,
} from '@opentalk/rest-api-rtk-query';
import i18next from 'i18next';

import { notifications, showConsentNotification } from '../../commonComponents';
import { createStreamUpdatedNotification } from '../../components/StreamUpdatedNotification';
import log from '../../logger';
import type { RootState } from '../../store';
import { startRecordingFailed, streamUpdated } from '../../store/slices/streamingSlice';
import { RecordingError, type Message as StreamingMessage } from '../types/incoming/streaming';
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

  it('notifies and shows consent when a stream becomes active', async () => {
    const dispatch = vi.fn();
    const targetId = 'stream-1' as StreamingTargetId;
    const data: StreamUpdatedMessage = {
      message: 'stream_updated',
      targetId,
      status: StreamStatus.Active,
    };
    const streamTarget: StreamingTargetEntity = {
      targetId,
      status: StreamStatus.Active,
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
        recording: StreamingStatus.Active,
        isStartRecordingRequested: false,
      },
    });

    await handleStreamingMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(streamUpdated(data));
    expect(createStreamUpdatedNotification).toHaveBeenCalledExactlyOnceWith({
      status: StreamStatus.Active,
      publicUrl: 'https://stream.example',
    });
    expect(showConsentNotification).toHaveBeenCalledExactlyOnceWith(dispatch);
  });

  it('skips consent notification when consent is already given', async () => {
    const dispatch = vi.fn();
    const targetId = 'stream-2' as StreamingTargetId;
    const data: StreamUpdatedMessage = {
      message: 'stream_updated',
      targetId,
      status: StreamStatus.Active,
    };
    const state = createState({
      streaming: {
        consent: true,
        streams: {
          ids: [],
          entities: {},
        },
        recording: StreamingStatus.Active,
        isStartRecordingRequested: false,
      },
    });

    await handleStreamingMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(streamUpdated(data));
    expect(createStreamUpdatedNotification).not.toHaveBeenCalled();
    expect(showConsentNotification).not.toHaveBeenCalled();
  });

  it('notifies and does not show a consent, when a stream becomes inactive', async () => {
    const dispatch = vi.fn();
    const targetId = 'stream-3' as StreamingTargetId;
    const data: StreamUpdatedMessage = {
      message: 'stream_updated',
      targetId,
      status: StreamStatus.Inactive,
    };
    const streamTarget: StreamingTargetEntity = {
      targetId,
      status: StreamStatus.Inactive,
      publicUrl: 'https://stream.example',
      name: 'Livestream 1',
    };
    const state = createState({
      streaming: {
        consent: true,
        streams: {
          ids: [targetId],
          entities: {
            [targetId]: streamTarget,
          },
        },
        recording: StreamingStatus.Inactive,
        isStartRecordingRequested: false,
      },
    });

    await handleStreamingMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(streamUpdated(data));
    expect(createStreamUpdatedNotification).toHaveBeenCalledExactlyOnceWith({
      status: StreamStatus.Inactive,
      publicUrl: 'https://stream.example',
    });
    expect(showConsentNotification).not.toHaveBeenCalled();
  });

  it.each([StreamStatus.Requested, StreamStatus.InUse, StreamStatus.Paused, StreamStatus.Error])(
    'does not notify for transient stream status "%s"',
    async (status) => {
      const dispatch = vi.fn();
      const targetId = 'stream-4' as StreamingTargetId;
      const reason: StreamErrorReason = {
        code: 'some_error_code',
        message: 'Some error message',
      };
      const data: StreamUpdatedMessage = {
        message: 'stream_updated',
        targetId,
        status,
        reason,
      };
      const streamTarget: StreamingTargetEntity = {
        targetId,
        status,
        publicUrl: 'https://stream.example',
        name: 'Livestream 1',
        reason,
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
          recording: StreamingStatus.Inactive,
          isStartRecordingRequested: false,
        },
      });

      await handleStreamingMessage(dispatch, data, state);

      expect(dispatch).toHaveBeenCalledWith(streamUpdated(data));
      expect(createStreamUpdatedNotification).not.toHaveBeenCalled();
      expect(showConsentNotification).not.toHaveBeenCalled();
    }
  );

  it.each([RecordingError.FailedToRequestRecordingService, RecordingError.RecorderNotStarted])(
    'resets the start recording request and notifies when the recording service is unavailable ("%s")',
    async (error) => {
      const dispatch = vi.fn();
      const state = createState();
      const data: StreamingMessage = { message: 'error', error };

      await handleStreamingMessage(dispatch, data, state);

      expect(dispatch).toHaveBeenCalledWith(startRecordingFailed());
      expect(i18next.t).toHaveBeenCalledWith('livestream-recording-error');
      expect(notifications.error).toHaveBeenCalledWith('livestream-recording-error');
      expect(log.error).toHaveBeenCalledWith('recording error:', error);
    }
  );

  it.each([
    RecordingError.InsufficientPermissions,
    RecordingError.RecordFeatureDisabled,
    RecordingError.RecordingAlreadyActive,
  ])('resets the start recording request without notifying on "%s"', async (error) => {
    const dispatch = vi.fn();
    const state = createState();
    const data: StreamingMessage = { message: 'error', error };

    await handleStreamingMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(startRecordingFailed());
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it.each([
    RecordingError.StreamFeatureDisabled,
    RecordingError.InvalidStreamingId,
    RecordingError.StreamingTargetInUse,
    RecordingError.RecordingNotActive,
  ])('ignores errors unrelated to starting a recording ("%s")', async (error) => {
    const dispatch = vi.fn();
    const state = createState();
    const data: StreamingMessage = { message: 'error', error };

    await handleStreamingMessage(dispatch, data, state);

    expect(dispatch).not.toHaveBeenCalled();
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('throws on unknown message types', async () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'unknown' } as unknown as StreamingMessage;

    await expect(handleStreamingMessage(dispatch, data, state)).rejects.toThrow(/Unknown message type/);
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Unknown recording message type'));
  });
});
