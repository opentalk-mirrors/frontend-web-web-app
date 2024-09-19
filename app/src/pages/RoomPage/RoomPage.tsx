// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import React from 'react';
import { useTranslation } from 'react-i18next';

import OpentalkError from '../../components/Error';
import LobbyView from '../../components/LobbyView';
import { useAppSelector } from '../../hooks';
import { useInviteCode } from '../../hooks/useInviteCode';
import { selectLivekitUnavailable } from '../../store/slices/livekitSlice';
import { ConnectionState, selectRoomConnectionState } from '../../store/slices/roomSlice';
import RoomLoadingView from './fragments/RoomLoadingView';

const MeetingView = React.lazy(() => import('../../components/MeetingView'));
const WaitingView = React.lazy(() => import('../../components/WaitingView'));
const RoomPage = () => {
  const { t } = useTranslation();

  const inviteCode = useInviteCode();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const connectionState: ConnectionState = useAppSelector(selectRoomConnectionState);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);

  if (isLivekitUnavailable) {
    return <OpentalkError title={t('error-livekit-unavailable')} />;
  }

  if (!isAuthenticated && !inviteCode) {
    console.warn('meeting page - not logged in - redirect');
    return <LobbyView />;
  }

  console.log('connectionState: ', connectionState);
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
      return <MeetingView />;
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
