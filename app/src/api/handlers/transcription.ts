// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
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
import { TranscriptionLanguage, TranscriptionStatus, TranscriptionMessage } from '../types/incoming/transcription';

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
      const { status: previousStatus, language: previousLanguage, liveTranscription } = state.transcription;
      const language = data.language && data.language in TranscriptionLanguage ? data.language : undefined;
      dispatch(transcriptionStatusUpdated(data.status));
      if (language) {
        dispatch(setTranscriptionLanguage(language));
      }

      // The service may also run for the meeting protocol alone, which is irrelevant for subtitles
      if (!liveTranscription || data.status !== TranscriptionStatus.Running) {
        break;
      }

      if (previousStatus !== TranscriptionStatus.Running) {
        showEnabledNotification();
      } else if (language && language !== previousLanguage) {
        notifications.info(
          i18next.t('subtitle-notification-language-changed', { language: TranscriptionLanguage[language] })
        );
      }
      break;
    }
    case 'modes_updated': {
      const { liveTranscription: wasLiveTranscriptionActive, status } = state.transcription;
      dispatch(
        transcriptionModesUpdated({ liveTranscription: data.liveTranscription, meetingProtocol: data.meetingProtocol })
      );

      if (wasLiveTranscriptionActive && !data.liveTranscription) {
        dispatch(hideSubtitles());
        notifications.info(i18next.t('subtitle-notification-disabled'));
      } else if (!wasLiveTranscriptionActive && data.liveTranscription && status === TranscriptionStatus.Running) {
        showEnabledNotification();
      }
      break;
    }
    case 'segment': {
      dispatch(segmentReceived(data));
      break;
    }
    case 'pdf_created':
    case 'meeting_protocol_consent_updated': {
      break;
    }
    case 'error': {
      notifications.error(i18next.t('transcription-error'));
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
