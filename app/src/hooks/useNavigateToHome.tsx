// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { batch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { ConnectionState } from '../modules/WebRTC/ConferenceRoom';
import { hangUp } from '../store/commonActions';
import { roomReset, selectRoomConnectionState } from '../store/slices/roomSlice';
import { useAppDispatch, useAppSelector } from './useCustomRedux';

/**
 * Navigates to dashboard and resets room state. Used when navigating out of lobby/room
 */
const useNavigateToHome = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const roomConnectionState = useAppSelector(selectRoomConnectionState);

  const navigateToHome = () => {
    batch(() => {
      //Conditionally hang up if user is in the waiting room, but not in the meeting itself.
      //Should be looked into again as part of https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1830
      if (roomConnectionState === ConnectionState.Waiting || roomConnectionState === ConnectionState.ReadyToEnter) {
        dispatch(hangUp());
      }
      dispatch(roomReset());
    });
    navigate('/dashboard');
  };

  return navigateToHome;
};

export default useNavigateToHome;
