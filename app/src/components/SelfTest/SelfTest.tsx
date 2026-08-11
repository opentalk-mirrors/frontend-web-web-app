// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography, useTheme } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { truncate } from 'lodash';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useGetRoomEventInfoQuery } from '../../api/rest';
import { useAppSelector } from '../../hooks';
import { useInviteCode } from '../../hooks/useInviteCode';
import { selectConfigFeatures } from '../../store/slices/configSlice';
import {
  selectAudioOutputDeviceId,
  selectLobbyAudioTrack,
  selectLobbyVideoEnabled,
} from '../../store/slices/livekitSlice';
import LobbyLayout from '../LobbyLayout';
import EchoPlayBack from './fragments/EchoPlayback';
import ToolbarContainer from './fragments/ToolbarContainer';
import VideoElement from './fragments/VideoElement';

interface SelftestProps {
  children: ReactNode;
  actionButton?: ReactNode;
  waitingRoom?: boolean;
}

const SelfTest = ({ children, actionButton, waitingRoom }: SelftestProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const inviteCode = useInviteCode();
  const localAudioTrack = useAppSelector(selectLobbyAudioTrack);
  const audioOutputDeviceId = useAppSelector(selectAudioOutputDeviceId);
  const { joinWithoutMedia } = useAppSelector(selectConfigFeatures);
  const videoEnabled = useAppSelector(selectLobbyVideoEnabled);

  const { roomId } = useParams<'roomId'>() as {
    roomId: RoomId;
  };
  const { data: roomData } = useGetRoomEventInfoQuery({ id: roomId, inviteCode: inviteCode }, { skip: !roomId });

  return (
    <LobbyLayout
      center={
        <>
          {videoEnabled ? (
            <VideoElement />
          ) : (
            <>
              {roomData?.title && (
                <Typography variant="h2" textAlign="center" marginBottom={theme.spacing(5)} component="h1">
                  {t('joinform-room-title', { title: truncate(roomData?.title, { length: 50 }) })}
                </Typography>
              )}
              <Typography
                variant="h1"
                textAlign="center"
                fontSize="2.9rem"
                lineHeight="2.9rem"
                mb={2}
                component="h2"
                lang="en"
              >
                {t('selftest-header')}
              </Typography>
              <Typography textAlign="center" fontSize="1.37rem" padding="0 0.5rem">
                {joinWithoutMedia ? t('selftest-body-do-test') : t('selftest-body')}
              </Typography>
            </>
          )}
          {localAudioTrack && (
            <EchoPlayBack localAudioTrack={localAudioTrack} audioOutputDeviceId={audioOutputDeviceId} />
          )}
        </>
      }
      bottom={
        <ToolbarContainer localAudioTrack={localAudioTrack} actionButton={actionButton} waitingRoom={waitingRoom}>
          {children}
        </ToolbarContainer>
      }
    />
  );
};

export default SelfTest;
