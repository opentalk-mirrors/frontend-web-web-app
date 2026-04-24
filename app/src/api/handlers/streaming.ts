// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RecordingStatus, StreamStatus } from '@opentalk/rest-api-rtk-query';
import i18next from 'i18next';

import { notifications, showConsentNotification } from '../../commonComponents';
import {
  createStreamUpdatedNotification,
  createRecordingUpdatedNotification,
} from '../../components/StreamUpdatedNotification';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { recordingStatusUpdated, streamUpdated } from '../../store/slices/streamingSlice';
import { streaming } from '../types/incoming';

/**
 * Handles messages in the streaming namespace.
 */
export const handleStreamingMessage = async (dispatch: AppDispatch, data: streaming.Message, state: RootState) => {
  switch (data.message) {
    case 'stream_updated': {
      dispatch(streamUpdated(data));

      const streamTarget = state.streaming.streams.entities[data.targetId];
      if (streamTarget) {
        createStreamUpdatedNotification({
          status: data.status,
          publicUrl: streamTarget.publicUrl,
        });
      }

      const { cameraEnabled, microphoneEnabled } = state.livekit.mediaSettings;
      const isActiveStream = data.status === StreamStatus.Active;
      const isMediaActive = cameraEnabled || microphoneEnabled;
      const isConsentRequired =
        isActiveStream && (state.streaming.consent === undefined || (!state.streaming.consent && isMediaActive));

      if (isConsentRequired) {
        await showConsentNotification(dispatch);
      }

      break;
    }
    case 'recording_updated': {
      dispatch(recordingStatusUpdated(data.status));

      if (data.status === RecordingStatus.Active || data.status === RecordingStatus.Inactive) {
        createRecordingUpdatedNotification({
          status: data.status,
          eventId: state.room.eventInfo?.id,
        });
      }

      const { cameraEnabled, microphoneEnabled } = state.livekit.mediaSettings;
      const isActiveRecording = data.status === RecordingStatus.Active;
      const isMediaActive = cameraEnabled || microphoneEnabled;
      const isConsentRequired =
        isActiveRecording && (state.streaming.consent === undefined || (!state.streaming.consent && isMediaActive));

      if (isConsentRequired) {
        await showConsentNotification(dispatch);
      }

      break;
    }
    case 'consent_updated': {
      break;
    }
    case 'service': {
      break;
    }
    case 'error': {
      if (data.error === 'recorder_not_started') {
        notifications.error(i18next.t('livestream-recording-error'));
        log.error('recording error:', data.error);
      }
      break;
    }
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown recording message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
