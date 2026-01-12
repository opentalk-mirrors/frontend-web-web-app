// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notificationAction } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { addWhiteboardAsset, setWhiteboardAvailable } from '../../store/slices/whiteboardSlice';
import { whiteboard } from '../types/incoming';
import { handleStorageExceededError } from './helpers';

/**
 * Handles whiteboard messages.
 */
export const handleWhiteboardMessage = (dispatch: AppDispatch, data: whiteboard.Message, state: RootState) => {
  switch (data.message) {
    case 'space_url':
      dispatch(setWhiteboardAvailable({ showWhiteboard: true, url: data.url }));
      break;
    case 'pdf_asset':
      dispatch(addWhiteboardAsset({ asset: { assetId: data.assetId, filename: data.filename } }));
      notificationAction({ msg: i18next.t('whiteboard-new-pdf-message'), variant: 'info', ariaLive: 'polite' });

      break;
    case 'error':
      handleStorageExceededError(state, data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown whiteboard message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
