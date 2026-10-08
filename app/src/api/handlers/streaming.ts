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
import { recordingStatusUpdated, startRecordingFailed, streamUpdated } from '../../store/slices/streamingSlice';
import { streaming } from '../types/incoming';
import { RecordingError } from '../types/incoming/streaming';

/**
 * Errors the backend may answer a start recording request with. Some of them are sent without a preceding
 * `recording_updated` message, so the pending start request has to be reset here.
 */
const START_RECORDING_ERRORS: ReadonlyArray<RecordingError> = [
  RecordingError.InsufficientPermissions,
  RecordingError.RecordFeatureDisabled,
  RecordingError.RecordingAlreadyActive,
  RecordingError.FailedToRequestRecordingService,
  RecordingError.RecorderNotStarted,
];

const RECORDING_SERVICE_UNAVAILABLE_ERRORS: ReadonlyArray<RecordingError> = [
  RecordingError.FailedToRequestRecordingService,
  RecordingError.RecorderNotStarted,
];

/**
 * Handles messages in the streaming namespace.
 */
export const handleStreamingMessage = async (dispatch: AppDispatch, data: streaming.Message, state: RootState) => {
  switch (data.message) {
    case 'stream_updated': {
      dispatch(streamUpdated(data));

      const streamTarget = state.streaming.streams.entities[data.targetId];
      const isNotifiableStatus = data.status === StreamStatus.Active || data.status === StreamStatus.Inactive;
      if (streamTarget && isNotifiableStatus) {
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
      if (START_RECORDING_ERRORS.includes(data.error)) {
        dispatch(startRecordingFailed());
      }
      if (RECORDING_SERVICE_UNAVAILABLE_ERRORS.includes(data.error)) {
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
