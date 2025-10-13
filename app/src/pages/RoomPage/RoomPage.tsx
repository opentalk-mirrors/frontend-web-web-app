// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import React from 'react';

import LobbyView from '../../components/LobbyView';
import { useAppSelector } from '../../hooks';
import { useInviteCode } from '../../hooks/useInviteCode';
import log from '../../logger';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { selectRoomConnectionState } from '../../store/slices/roomSlice';
import RoomLoadingView from './fragments/RoomLoadingView';

const MeetingView = React.lazy(() => import('../../components/MeetingView'));
const WaitingView = React.lazy(() => import('../../components/WaitingView'));
const RoomPage = () => {
  const inviteCode = useInviteCode();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const connectionState: ConnectionState = useAppSelector(selectRoomConnectionState);

  if (!isAuthenticated && !inviteCode) {
    log.warn('meeting page - not logged in - redirect');
    return <LobbyView />;
  }

  log.debug('connection: ', connectionState);

  switch (connectionState) {
    // Regular state machine flow
    case ConnectionState.Initial:
    case ConnectionState.Setup:
    case ConnectionState.FailedCredentials:
    case ConnectionState.Left:
      return <LobbyView />;
    case ConnectionState.Starting:
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
