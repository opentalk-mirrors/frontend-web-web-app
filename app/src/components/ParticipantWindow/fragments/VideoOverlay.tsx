// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';
import { Grid, Tooltip, styled } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { ParticipantEvent, Track } from 'livekit-client';
import { MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';

import { requestPopoutStreamAccessToken } from '../../../api/types/outgoing/livekit';
import { ExtendToTabIcon, FullscreenViewIcon, PinIcon } from '../../../assets/icons';
import { OverlayIconButton } from '../../../commonComponents';
import LayoutOptions from '../../../enums/LayoutOptions';
import { useAppDispatch, useAppSelector, useConferenceUiVersion } from '../../../hooks';
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
import { setPinnedTile, selectCinemaLayout, selectPinnedTile } from '../../../store/slices/uiSlice';
import { ConnectionIdentifier, MediaSessionType, TileIdentifier } from '../../../types';
import { deconstructConnectionIdentifier } from '../../../utils/deconstructConnectionIdentifier';
import { isSameTile } from '../../../utils/isSameTile';
import BrokenSubscriberIndicator from './BrokenSubscriberIndicator';

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
  connectionIdentifier: ConnectionIdentifier;
  active: boolean;
  source: MediaSessionType;
}

const VideoOverlay = ({ connectionIdentifier, active, source }: VideoOverlayProps) => {
  const { isV2 } = useConferenceUiVersion();
  const { participantId } = deconstructConnectionIdentifier(connectionIdentifier);
  const userLayout = useAppSelector(selectCinemaLayout);
  const [channelId, setChannelId] = useState<string | undefined>();
  const dispatch = useAppDispatch();
  const screenDescriptor = useMemo<MediaDescriptor>(
    () => ({
      connectionIdentifier,
      mediaType: Track.Source.ScreenShare,
    }),
    [connectionIdentifier]
  );
  const videoDescriptor = useMemo<MediaDescriptor>(
    () => ({ connectionIdentifier, mediaType: Track.Source.Camera }),
    [connectionIdentifier]
  );

  const participant = useRemoteParticipant(screenDescriptor.connectionIdentifier, {
    updateOnlyOn: [
      ParticipantEvent.TrackMuted,
      ParticipantEvent.TrackUnmuted,
      ParticipantEvent.TrackSubscribed,
      ParticipantEvent.TrackUnsubscribed,
    ],
  });
  const isScreenShareActive = participant?.isScreenShareEnabled;
  const isVideoActive = participant?.isCameraEnabled;
  const isScreenShareOrVideoActive = isScreenShareActive || isVideoActive;
  // V2-CLEANUP: after transition to V2 use the source only
  const showsScreenShare = isV2 ? source === Track.Source.ScreenShare : isScreenShareActive;
  const descriptor = showsScreenShare ? screenDescriptor : videoDescriptor;
  const tile = useMemo<TileIdentifier>(() => ({ connectionIdentifier, source }), [connectionIdentifier, source]);
  const displayName = useAppSelector((state) => selectParticipantName(state, participantId));
  const pinnedTile = useAppSelector(selectPinnedTile);
  // V2-CLEANUP: After transition to V2 use isSameTile check only
  const isPinned = isV2 ? isSameTile(pinnedTile, tile) : pinnedTile?.connectionIdentifier === connectionIdentifier;
  const popoutStreamAccess = useAppSelector((state) =>
    selectLivekitPopoutStreamAccessByParticipantId(state, connectionIdentifier)
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
              connectionIdentifier: popoutStreamAccess.mediaDescriptor.connectionIdentifier,
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
    dispatch(setPinnedTile(isPinned ? undefined : tile));
  }, [dispatch, isPinned, tile]);

  const openFullScreenView: MouseEventHandler = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(setPinnedTile(tile));
      dispatch(fullscreenActions.request());
    },
    [dispatch, tile]
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
                  aria-pressed={isPinned}
                >
                  <PinIcon />
                </OverlayIconButton>
              </Tooltip>
            )}
            {isFullscreenSupported && (
              <Tooltip title={t('video-overlay-tooltip-fullscreen')}>
                <OverlayIconButton
                  aria-label={t('global-fullscreen-open')}
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
