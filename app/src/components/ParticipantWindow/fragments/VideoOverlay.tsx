// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';
import { Grid, Tooltip, styled } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { Track } from 'livekit-client';
import { MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';

import { requestPopoutStreamAccessToken } from '../../../api/types/outgoing/livekit';
import { ExtendToTabIcon, FullscreenViewIcon, PinIcon } from '../../../assets/icons';
import LayoutOptions from '../../../enums/LayoutOptions';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { MediaDescriptor } from '../../../modules/WebRTC';
import { fullscreenActions, selectFullscreenSupported } from '../../../store/slices/fullscreen/slice';
import {
  addPopoutStreamAccess,
  deleteLivekitPopoutStreamAccessToken,
  selectLivekitPopoutStreamAccessByParticipantId,
  selectLivekitPublicUrl,
} from '../../../store/slices/livekitSlice';
import { selectParticipantName } from '../../../store/slices/participantsSlice';
import { selectE2EEncryption } from '../../../store/slices/roomSlice';
import { pinnedParticipantIdSet, selectCinemaLayout, selectPinnedParticipantId } from '../../../store/slices/uiSlice';
import { ParticipantId } from '../../../types';
import BrokenSubscriberIndicator from './BrokenSubscriberIndicator';
import { OverlayIconButton } from './OverlayIconButton';

const OverlayContainer = styled(Grid)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  fontSize: 'inherit',
  width: '100%',
  padding: theme.spacing(1),
  background: 'transparent',
}));

const IndicatorContainer = styled(Grid)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: theme.spacing(3),
  gap: theme.spacing(1),
}));

interface VideoOverlayProps {
  participantId: ParticipantId;
  active: boolean;
}

const VideoOverlay = ({ participantId, active }: VideoOverlayProps) => {
  const userLayout = useAppSelector(selectCinemaLayout);
  const [channelId, setChannelId] = useState<string | undefined>();
  const dispatch = useAppDispatch();
  const screenDescriptor = useMemo<MediaDescriptor>(
    () => ({
      participantId,
      mediaType: Track.Source.ScreenShare,
    }),
    [participantId]
  );
  const videoDescriptor = useMemo<MediaDescriptor>(
    () => ({ participantId, mediaType: Track.Source.Camera }),
    [participantId]
  );

  const participant = useRemoteParticipant(screenDescriptor.participantId);
  const isScreenShareActive = participant?.isScreenShareEnabled;
  const isVideoActive = participant?.isCameraEnabled;
  const isScreenShareOrVideoActive = isScreenShareActive || isVideoActive;
  const descriptor = isScreenShareActive ? screenDescriptor : videoDescriptor;
  const displayName = useAppSelector((state) => selectParticipantName(state, participantId));
  const pinnedParticipantId = useAppSelector(selectPinnedParticipantId);
  const popoutStreamAccess = useAppSelector((state) =>
    selectLivekitPopoutStreamAccessByParticipantId(state, participantId)
  );
  const { t } = useTranslation();
  const livekitUrl = useAppSelector(selectLivekitPublicUrl);
  const { roomId } = useParams<'roomId'>() as {
    roomId: RoomId;
  };
  const isFullscreenSupported = useAppSelector(selectFullscreenSupported);
  const isE2EEnabled = useAppSelector(selectE2EEncryption);

  // Opening url is known bug in react -> https://github.com/facebook/react/issues/17355
  // Using setTimeout as a workaround
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const token = popoutStreamAccess?.token;
      if (!channelId || !token) {
        return;
      }

      const url = new URL(`${window.location.origin}/room/extended/${channelId}`);
      const channel = new BroadcastChannel(channelId);
      channel.onmessage = (event) => {
        if (event.data.namespace === 'extended_tab' && event.data.payload.action === 'request_livekit_data') {
          channel.postMessage({
            namespace: 'extended_tab',
            payload: {
              action: 'livekit_data',
              accessToken: token,
              mediaType: popoutStreamAccess.mediaDescriptor.mediaType,
              participantId: popoutStreamAccess.mediaDescriptor.participantId,
              livekitUrl,
              roomId,
            },
          });
          setChannelId(undefined);
          dispatch(deleteLivekitPopoutStreamAccessToken(token));
        }
      };
      window.open(url.toString(), '_blank');
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [channelId, dispatch, livekitUrl, popoutStreamAccess, roomId]);

  const togglePin = useCallback(() => {
    const updatePinnedId = pinnedParticipantId === participantId ? undefined : participantId;
    dispatch(pinnedParticipantIdSet(updatePinnedId));
  }, [dispatch, participantId, pinnedParticipantId]);

  const openFullScreenView: MouseEventHandler = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(pinnedParticipantIdSet(participantId as ParticipantId));
      dispatch(fullscreenActions.request());
    },
    [dispatch, participantId]
  );

  const openInNewTab: MouseEventHandler = (event) => {
    event.stopPropagation();
    setChannelId(uuid());
    dispatch(addPopoutStreamAccess(descriptor));
    dispatch(requestPopoutStreamAccessToken.action());
  };

  return (
    <OverlayContainer>
      <IndicatorContainer>
        {active && (
          <>
            {userLayout === LayoutOptions.Speaker && (
              <Tooltip title={t('video-overlay-tooltip-pin-video')}>
                <OverlayIconButton
                  onClick={togglePin}
                  translate="no"
                  aria-label={t('indicator-pinned', {
                    participantName: displayName || '',
                  })}
                  aria-pressed={pinnedParticipantId === descriptor.participantId}
                >
                  <PinIcon />
                </OverlayIconButton>
              </Tooltip>
            )}
            {isFullscreenSupported && (
              <Tooltip title={t('video-overlay-tooltip-fullscreen')}>
                <OverlayIconButton
                  aria-label={t('indicator-fullscreen-open')}
                  onClick={openFullScreenView}
                  color="primary"
                >
                  <FullscreenViewIcon />
                </OverlayIconButton>
              </Tooltip>
            )}
            {!isE2EEnabled && isScreenShareOrVideoActive && (
              <Tooltip title={t('video-overlay-tooltip-separate-window')}>
                <OverlayIconButton aria-label={t('global-open-new-tab')} color="primary" onClick={openInNewTab}>
                  <ExtendToTabIcon />
                </OverlayIconButton>
              </Tooltip>
            )}
          </>
        )}
        <BrokenSubscriberIndicator descriptor={descriptor} />
      </IndicatorContainer>
    </OverlayContainer>
  );
};

export default VideoOverlay;
