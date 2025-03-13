// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import React from 'react';
import { useParams } from 'react-router-dom';

import LobbyView from '../../components/LobbyView';
import { useAppSelector } from '../../hooks';
import useE2EE from '../../hooks/useE2EE';
import { useInviteCode } from '../../hooks/useInviteCode';
import { usePreventSpaceKey } from '../../hooks/usePreventSpaceKey';
import { ConnectionState, selectRoomConnectionState } from '../../store/slices/roomSlice';
import RoomLoadingView from './fragments/RoomLoadingView';

const MeetingView = React.lazy(() => import('../../components/MeetingView'));
const WaitingView = React.lazy(() => import('../../components/WaitingView'));
const RoomPage = () => {
  const { roomId } = useParams<'roomId'>() as {
    roomId: RoomId;
  };
  const e2eeData = useE2EE(roomId);

  const inviteCode = useInviteCode();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const connectionState: ConnectionState = useAppSelector(selectRoomConnectionState);

  usePreventSpaceKey();

  if (!isAuthenticated && !inviteCode) {
    console.warn('meeting page - not logged in - redirect');
    return <LobbyView />;
  }

  console.debug('connection: ', connectionState);

  switch (connectionState) {
    // Regular state machine flow
    case ConnectionState.Initial:
    case ConnectionState.Setup:
    case ConnectionState.FailedCredentials:
    case ConnectionState.Left:
      return <LobbyView />;
    case ConnectionState.Starting:
    case ConnectionState.Failed:
      return <RoomLoadingView />;
    case ConnectionState.Online:
    case ConnectionState.Leaving:
      return <MeetingView e2eeData={e2eeData} />;
    // Exception states
    case ConnectionState.ReadyToEnter:
    case ConnectionState.Waiting:
      return <WaitingView />;
    case ConnectionState.Blocked:
      return <RoomLoadingView />;
    default:
      console.error('room state unknown', connectionState);
      return <LobbyView />;
  }
};

export default RoomPage;
