// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import type { AppDispatch } from '../../store';
import { sharedFolderUpdated } from '../../store/slices/sharedFolderSlice';
import { sharedFolder } from '../types/incoming';

/**
 * Handles shared folder messages.
 */
export const handleSharedFolderMessage = (dispatch: AppDispatch, data: sharedFolder.Message) => {
  switch (data.message) {
    case 'updated':
      dispatch(sharedFolderUpdated({ read: data.read, readWrite: data.readWrite }));
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown shared_folder message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
