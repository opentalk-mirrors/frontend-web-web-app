// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notificationAction } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import {
  addWhiteboardAsset,
  setEditRestrictions,
  setStarted,
  setWhiteboardAvailable,
  updateRemoteScene,
} from '../../store/slices/whiteboardSlice';
import { whiteboard } from '../types/incoming';
import { handleStorageExceededError } from './helpers';

/**
 * Handles whiteboard messages.
 */
export const handleWhiteboardMessage = (
  dispatch: AppDispatch,
  payload: whiteboard.ExcalidrawMessage | whiteboard.SpacedeckMessage,
  state: RootState
) => {
  switch (payload.message) {
    case 'initialized':
      dispatch(setWhiteboardAvailable({ url: payload.url }));
      break;
    case 'pdf_created':
      dispatch(addWhiteboardAsset({ asset: { assetId: payload.assetId, filename: payload.filename } }));
      notificationAction({ msg: i18next.t('whiteboard-new-pdf-message'), variant: 'info', ariaLive: 'polite' });
      break;
    case 'started':
      dispatch(
        setStarted({ initialElements: payload.initialScene.elements, editRestrictions: payload.editRestrictions })
      );
      break;
    case 'scene_stored':
      dispatch(
        updateRemoteScene({
          elements: payload.scene.elements,
          appState: payload.scene.appState,
        })
      );
      break;
    case 'broadcast':
    case 'volatile_broadcast':
    case 'followed':
    case 'unfollowed':
    case 'follower_gained':
    case 'follower_lost':
      // These messages are handled in app/src/components/WhiteboardView/WhiteboardView.tsx
      break;
    case 'edit_restrictions_enabled':
      dispatch(setEditRestrictions({ enabled: true, participants: payload.unrestrictedParticipants }));
      break;
    case 'edit_restrictions_disabled':
      dispatch(setEditRestrictions({ enabled: false, participants: [] }));
      break;
    case 'error':
      handleStorageExceededError(state, payload.error);
      break;
    default: {
      const dataString = JSON.stringify(payload, null, 2);
      log.error(`Unknown whiteboard message type: ${dataString}`);
    }
  }
};
