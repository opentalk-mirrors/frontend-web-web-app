// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import LayoutOptions from '../../enums/LayoutOptions';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { updatedCinemaLayout } from '../../store/slices/uiSlice';
import { setEditRestrictions, setStarted, setStopped, updateRemoteScene } from '../../store/slices/whiteboardSlice';
import { whiteboard } from '../types/incoming';

/**
 * Handles whiteboard messages.
 */
export const handleWhiteboardMessage = (
  dispatch: AppDispatch,
  payload: whiteboard.WhiteboardPayload,
  state: RootState
) => {
  switch (payload.message) {
    case 'started':
      dispatch(
        setStarted({ initialElements: payload.initialScene.elements, editRestrictions: payload.editRestrictions })
      );
      dispatch(updatedCinemaLayout({ layout: LayoutOptions.Whiteboard, cacheLastLayout: false }));
      break;
    case 'stopped':
      dispatch(setStopped());
      if (state.ui.cinemaLayout === LayoutOptions.Whiteboard) {
        dispatch(updatedCinemaLayout({ layout: state.ui.lastCinemaLayout, cacheLastLayout: false }));
      }
      break;
    case 'scene_stored':
      dispatch(
        updateRemoteScene({
          elements: payload.scene.elements,
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
      // Surfaced to the user in app/src/components/WhiteboardView/WhiteboardView.tsx
      break;
    default: {
      const dataString = JSON.stringify(payload, null, 2);
      log.error(`Unknown whiteboard message type: ${dataString}`);
    }
  }
};
