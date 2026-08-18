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
  transcriptionStatusUpdated,
} from '../../store/slices/transcriptionSlice';
import { TranscriptionLanguage, TranscriptionStatus, TranscriptionMessage } from '../types/incoming/transcription';

/**
 * Handles messages in the transcription namespace.
 */
export const handleTranscriptionMessage = (dispatch: AppDispatch, data: TranscriptionMessage, state: RootState) => {
  switch (data.message) {
    case 'state_updated': {
      dispatch(transcriptionStatusUpdated(data.status));
      if (data.language in TranscriptionLanguage) {
        dispatch(setTranscriptionLanguage(data.language));
      }

      // if the status has not changed but the language has, we also want to notify the user about the language change
      if (
        data.status === state.transcription.status &&
        data.status === TranscriptionStatus.Running &&
        data.language !== state.transcription.language &&
        data.language in TranscriptionLanguage
      ) {
        notifications.info(
          i18next.t('subtitle-notification-language-changed', { language: TranscriptionLanguage[data.language] })
        );
        break;
      }
      switch (data.status) {
        case TranscriptionStatus.Inactive: {
          dispatch(hideSubtitles());
          notifications.info(i18next.t('subtitle-notification-disabled'));
          break;
        }
        case TranscriptionStatus.Requested:
          break;
        case TranscriptionStatus.Running: {
          notifications.showTranscriptionEnabledNotification({
            onActivated: () => {
              dispatch(showSubtitles());
            },
          });
          break;
        }
      }

      break;
    }
    case 'segment': {
      dispatch(segmentReceived(data));
      break;
    }
    case 'service_command': {
      // directed to the transcription service, not the client, so no action needed here
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
