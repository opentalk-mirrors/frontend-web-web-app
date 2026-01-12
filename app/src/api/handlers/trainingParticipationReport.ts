// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notificationAction } from '../../commonComponents';
import { showWithLinkNotification } from '../../components/WithLinkNotification';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import {
  trainingParticipationReportDisabled,
  trainingParticipationReportEnabled,
} from '../../store/slices/moderationSlice';
import { presenceConfirmationDone, presenceConfirmationRequested } from '../../store/slices/roomSlice';
import { composeMeetingDetailsUrl } from '../../utils/apiUtils';
import { trainingParticipationReport } from '../types/incoming';
import { handleStorageExceededError, showErrorNotification } from './helpers';

/**
 * Handles training participation report messages.
 */
export const handleTrainingParticipationReportMessage = (
  dispatch: AppDispatch,
  data: trainingParticipationReport.Message,
  state: RootState
) => {
  switch (data.message) {
    case 'presence_logging_enabled':
      if (state.room.isOwnedByCurrentUser) {
        dispatch(trainingParticipationReportEnabled());
        notificationAction({
          msg: i18next.t('presence-logging-enabled-notification'),
          variant: 'info',
          ariaLive: 'polite',
        });
      }
      break;
    case 'presence_logging_disabled':
      if (state.room.isOwnedByCurrentUser) {
        dispatch(trainingParticipationReportDisabled());
        notificationAction({
          msg: i18next.t('presence-logging-disabled-notification'),
          variant: 'info',
          ariaLive: 'polite',
        });
      }
      break;
    case 'presence_logging_started':
      if (state.room.isOwnedByCurrentUser) {
        notificationAction({
          msg: i18next.t('presence-logging-started-notification'),
          variant: 'info',
          ariaLive: 'polite',
        });
      }
      break;
    case 'presence_logging_ended':
      if (state.room.isOwnedByCurrentUser) {
        notificationAction({
          msg: i18next.t('presence-logging-ended-notification'),
          variant: 'info',
          ariaLive: 'polite',
        });
      } else {
        dispatch(presenceConfirmationDone());
      }
      break;
    case 'presence_confirmation_requested':
      dispatch(presenceConfirmationRequested());
      break;
    case 'presence_confirmation_logged':
      dispatch(presenceConfirmationDone());
      break;
    case 'pdf_asset': {
      if (state.room.isOwnedByCurrentUser) {
        let assetLocation;
        if (state.room.eventInfo?.id) {
          assetLocation = composeMeetingDetailsUrl(state.config.baseUrl, state.room.eventInfo?.id).href;
        }
        showWithLinkNotification({
          translationKey: 'training-participation-report-pdf-asset-notification',
          url: assetLocation,
        });
      }
      break;
    }
    case 'error':
      handleStorageExceededError(state, data.error);
      showErrorNotification(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown training participation report message type: ${dataString}`);
    }
  }
};
