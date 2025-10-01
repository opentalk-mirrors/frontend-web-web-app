// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { showWithLinkNotification } from '../../components/WithLinkNotification';
import log from '../../logger';
import type { RootState } from '../../store';
import { composeMeetingDetailsUrl } from '../../utils/apiUtils';
import { meetingReport } from '../types/incoming';
import { handleStorageExceededError } from './helpers';

/**
 * Handles meetingReport messages.
 */
export const handleMeetingReportMessage = (data: meetingReport.Message, state: RootState) => {
  let assetLocation: string | undefined;
  switch (data.message) {
    case 'pdf_asset':
      if (state.room.eventInfo?.id) {
        assetLocation = composeMeetingDetailsUrl(state.config.baseUrl, state.room.eventInfo?.id).href;
      }
      showWithLinkNotification({ translationKey: 'meeting-report-pdf-asset-message', url: assetLocation });
      break;
    case 'error':
      handleStorageExceededError(state, data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown meeting report message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
