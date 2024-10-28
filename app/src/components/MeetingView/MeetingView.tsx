// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { isWeb } from '@livekit/components-core';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { styled } from '@mui/material';
import {
  DeviceUnsupportedError,
  E2EEOptions,
  ExternalE2EEKeyProvider,
  Room,
  RoomOptions,
  VideoPresets,
} from 'livekit-client';
import { memo, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { notifications } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import useE2EE from '../../hooks/useE2EE';
import { useHotkeys } from '../../hooks/useHotkeys';
import useLivekitEvents from '../../hooks/useLivekitEvents';
import { useUpdateDocumentTitle } from '../../hooks/useUpdateDocumentTitle';
import { useMediaChoices } from '../../provider/MediaChoicesProvider';
import { selectRoomTitle } from '../../store/selectors';
import { selectLivekitAccessToken, selectLivekitPublicUrl, setLivekitRoom } from '../../store/slices/livekitSlice';
import { selectShouldForceMuted } from '../../store/slices/moderationSlice';
import { selectShowCoffeeBreakCurtain } from '../../store/slices/uiSlice';
import { selectIsModerator } from '../../store/slices/userSlice';
import { CoffeeBreakView } from '../CoffeeBreakView/CoffeeBreakView';
import TimerPopover from '../TimerPopover';
import InnerLayout from './fragments/InnerLayout';

const Container = styled('div')(({ theme }) => ({
  background: theme.palette.background.overlay,
  overflow: 'auto',
  display: 'grid',
  height: '100%',
  width: '100%',

  '&.MuiContainer-root': {
    paddingLeft: 0,
    paddingRight: 0,
  },
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
}));

const RoomContainer = styled(LiveKitRoom)(() => {
  return {
    display: 'contents',
  };
});

const CachedTimerPopover = memo(TimerPopover);
const CachedInnerLayout = memo(InnerLayout);

const MeetingView = () => {
  const { t } = useTranslation();

  const showCoffeeBreakCurtain = useAppSelector(selectShowCoffeeBreakCurtain);
  const isModerator = useAppSelector(selectIsModerator);
  const containerRef = useRef(null);
  const enableAudio = isModerator || !showCoffeeBreakCurtain;
  const livekitAccessToken = useAppSelector(selectLivekitAccessToken);
  const publicUrl = useAppSelector(selectLivekitPublicUrl);

  const shouldForceMuted = useAppSelector(selectShouldForceMuted);
  const mediaChoices = useMediaChoices();

  useHotkeys();
  useUpdateDocumentTitle(useAppSelector(selectRoomTitle));

  const keyProvider = useMemo(() => new ExternalE2EEKeyProvider(), []);
  const { worker, e2eePassphrase, e2eeEnabled } = useE2EE();

  const roomOptions = useMemo((): RoomOptions | undefined => {
    if (!livekitAccessToken) {
      return undefined;
    }

    return {
      publishDefaults: {
        /*
         * Up to two additional simulcast layers to publish in addition to the original
         * Track.
         * When left blank, it defaults to h180, h360.
         * If a SVC codec is used (VP9 or AV1), this field has no effect.
         * videoSimulcastLayers: [VideoPresets.h1080, VideoPresets.h720],
         * */
        red: !e2eeEnabled,
        simulcast: true,
      },
      dynacast: true,
      disconnectOnPageLeave: false,
      adaptiveStream: true,
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
      },
      e2ee: e2eeEnabled
        ? ({
            keyProvider,
            worker,
          } as E2EEOptions)
        : undefined,
    };
  }, [keyProvider, worker, e2eeEnabled, livekitAccessToken]);

  const room = useMemo(() => {
    const roomInstance = new Room(roomOptions);
    setLivekitRoom(roomInstance);

    // Mutes the user if microphones are disabled in conference
    if (shouldForceMuted && mediaChoices?.userChoices.audioEnabled) {
      roomInstance.localParticipant.setMicrophoneEnabled(false);
      mediaChoices?.saveAudioInputEnabled(false);
    }

    return roomInstance;
  }, [roomOptions]);

  if (e2eeEnabled && !room.isE2EEEnabled) {
    keyProvider.setKey(e2eePassphrase);
    room.setE2EEEnabled(true).catch((e) => {
      if (e instanceof DeviceUnsupportedError) {
        notifications.error(t('unsupported-browser-e2e-encryption-dialog-message'));
      }
    });
  }

  useEffect(() => {
    const onPageLeave = async () => {
      await room.disconnect();
    };

    if (isWeb()) {
      window.addEventListener('beforeunload', onPageLeave);
    }

    return () => {
      if (isWeb()) {
        window.removeEventListener('beforeunload', onPageLeave);
      }
    };
  }, [room]);

  useEffect(() => {
    return () => {
      room.localParticipant.trackPublications.forEach((publication) => {
        publication.track?.mediaStreamTrack.stop();
        publication.track?.stop();
      });
    };
  }, [room.localParticipant.trackPublications]);

  useLivekitEvents(room);

  return (
    <RoomContainer room={room} token={livekitAccessToken} serverUrl={publicUrl} video={false} audio={false}>
      <Container ref={containerRef}>
        {showCoffeeBreakCurtain && !isModerator ? (
          <CoffeeBreakView />
        ) : (
          <>
            {enableAudio && <RoomAudioRenderer />}

            {!showCoffeeBreakCurtain && <CachedTimerPopover />}

            <CachedInnerLayout />
          </>
        )}
      </Container>
    </RoomContainer>
  );
};

export default MeetingView;
