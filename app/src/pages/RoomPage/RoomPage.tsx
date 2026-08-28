// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import React from 'react';

import LobbyView from '../../components/LobbyView';
import { useAppSelector } from '../../hooks';
import log from '../../logger';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { selectHasJoinedConference, selectRoomConnectionState } from '../../store/slices/roomSlice';
import RoomLoadingView from './fragments/RoomLoadingView';

const MeetingView = React.lazy(() => import('../../components/MeetingView'));
const WaitingView = React.lazy(() => import('../../components/WaitingView'));
const RoomPage = () => {
  const connectionState: ConnectionState = useAppSelector(selectRoomConnectionState);
  const hasJoinedConference = useAppSelector(selectHasJoinedConference);

  log.debug('connection: ', connectionState);

  switch (connectionState) {
    // Regular state machine flow
    case ConnectionState.Initial:
    case ConnectionState.Setup:
    case ConnectionState.Lobby:
    case ConnectionState.FailedCredentials:
    case ConnectionState.Left:
      return <LobbyView />;
    case ConnectionState.Starting:
      // While opening the signaling connection for the first time the participant is still in the lobby,
      // keep the lobby visible to prevent flashing the full-screen loading view
      return hasJoinedConference ? <RoomLoadingView /> : <LobbyView />;
    case ConnectionState.Failed:
    case ConnectionState.Blocked:
      return <RoomLoadingView />;
    case ConnectionState.Online:
    case ConnectionState.Leaving:
      return <MeetingView />;
    // Exception states
    case ConnectionState.ReadyToEnter:
    case ConnectionState.Waiting:
      return <WaitingView />;
    default:
      log.error('room state unknown', connectionState);
      return <LobbyView />;
  }
};

export default RoomPage;
