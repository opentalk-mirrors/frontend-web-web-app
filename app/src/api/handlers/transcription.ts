// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import { showWithLinkNotification } from '../../components/WithLinkNotification';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import {
  hideSubtitles,
  segmentReceived,
  setTranscriptionLanguage,
  showSubtitles,
  transcriptionModesUpdated,
  transcriptionStatusUpdated,
} from '../../store/slices/transcriptionSlice';
import { composeMeetingDetailsUrl } from '../../utils/apiUtils';
import {
  TranscriptionError,
  TranscriptionLanguage,
  TranscriptionStatus,
  TranscriptionMessage,
} from '../types/incoming/transcription';

/**
 * Handles messages in the transcription namespace.
 */
export const handleTranscriptionMessage = (dispatch: AppDispatch, data: TranscriptionMessage, state: RootState) => {
  const showEnabledNotification = () =>
    notifications.showTranscriptionEnabledNotification({
      onActivated: () => {
        dispatch(showSubtitles());
      },
    });

  switch (data.message) {
    case 'state_updated': {
      const {
        status: previousStatus,
        language: previousLanguage,
        liveTranscription,
        automaticMeetingProtocol,
      } = state.transcription;
      const language = data.language && data.language in TranscriptionLanguage ? data.language : undefined;
      dispatch(transcriptionStatusUpdated(data.status));
      if (language) {
        dispatch(setTranscriptionLanguage(language));
      }

      if (data.status !== TranscriptionStatus.Running) {
        break;
      }

      if (liveTranscription) {
        // Show the notification only if transcription has not been running before
        // Otherwise same notification will be triggered by the `modes_updated` event
        if (previousStatus !== TranscriptionStatus.Running) {
          showEnabledNotification();
        } else if (language && language !== previousLanguage) {
          notifications.info(
            i18next.t('subtitle-notification-language-changed', { language: TranscriptionLanguage[language] })
          );
        }
      }
      // Show the notification only if transcription has not been running before
      // Otherwise same notification will be triggered by the `modes_updated` event
      if (automaticMeetingProtocol && previousStatus !== TranscriptionStatus.Running) {
        notifications.info(i18next.t('automatic-meeting-protocol-notification-started'));
      }

      break;
    }
    case 'modes_updated': {
      const {
        liveTranscription: wasLiveTranscriptionActive,
        automaticMeetingProtocol: oldAutomaticMeetingProtocolState,
        status,
      } = state.transcription;
      dispatch(
        transcriptionModesUpdated({
          liveTranscription: data.liveTranscription,
          automaticMeetingProtocol: data.automaticMeetingProtocol,
        })
      );

      if (wasLiveTranscriptionActive && !data.liveTranscription) {
        dispatch(hideSubtitles());
        notifications.info(i18next.t('subtitle-notification-disabled'));
      } else if (!wasLiveTranscriptionActive && data.liveTranscription && status === TranscriptionStatus.Running) {
        showEnabledNotification();
      }

      const wasAutomaticMeetingProtocolActive = Boolean(oldAutomaticMeetingProtocolState);
      if (
        !wasAutomaticMeetingProtocolActive &&
        data.automaticMeetingProtocol &&
        status === TranscriptionStatus.Running
      ) {
        notifications.info(i18next.t('automatic-meeting-protocol-notification-started'));
      }
      if (wasAutomaticMeetingProtocolActive && !data.automaticMeetingProtocol) {
        notifications.info(i18next.t('automatic-meeting-protocol-notification-stopped'));
      }

      break;
    }
    case 'segment': {
      dispatch(segmentReceived(data));
      break;
    }
    case 'pdf_created': {
      const eventId = state.room.eventInfo?.id;
      // Relevant only for invited registered
      // Currently fronted cannot differentiate between invited and non-invited registered participants
      if (selectIsAuthenticated(state) && eventId) {
        showWithLinkNotification({
          translationKey: 'automatic-meeting-protocol-pdf-created-with-link-notification',
          url: composeMeetingDetailsUrl(state.config.baseUrl, eventId).href,
        });
      }
      break;
    }
    case 'automatic_meeting_protocol_consent_updated': {
      break;
    }
    case 'error': {
      switch (data.error) {
        case TranscriptionError.GenerateAutomaticMeetingProtocol:
          // Error is only relevant to those, who could download the transcript
          if (selectIsAuthenticated(state)) {
            notifications.error(i18next.t('automatic-meeting-protocol-notification-generate-error'));
          }
          break;
        default:
          notifications.error(i18next.t('transcription-error'));
          break;
      }
      log.error('transcription error:', data.error);
      break;
    }
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown transcription message type: ${dataString}`);
      throw new Error(`Unknown transcription message type: ${dataString}`);
    }
  }
};
