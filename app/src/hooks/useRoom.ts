// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { isWeb } from '@livekit/components-core';
import {
  DeviceUnsupportedError,
  E2EEOptions,
  ExternalE2EEKeyProvider,
  Room,
  RoomOptions,
  VideoPresets,
} from 'livekit-client';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { notifications } from '../commonComponents';
import { useMediaChoices } from '../provider/MediaChoicesProvider';
import { setLivekitRoom } from '../store/slices/livekitSlice';
import { selectShouldForceMuted } from '../store/slices/moderationSlice';
import { useAppSelector } from './index';
import useE2EE from './useE2EE';
import useLivekitEvents from './useLivekitEvents';

interface IUseRoomOptions {
  audioInputEnabled?: boolean;
  videoInputEnabled?: boolean;
  isWhisperRoom?: boolean;
}

const useRoom = ({
  audioInputEnabled = false,
  videoInputEnabled = false,
  isWhisperRoom = false,
}: IUseRoomOptions = {}): Room | undefined => {
  const { t } = useTranslation();
  const keyProvider = useMemo(() => new ExternalE2EEKeyProvider(), []);
  const { worker, e2eePassphrase, e2eeEnabled } = useE2EE();
  const shouldForceMuted = useAppSelector(selectShouldForceMuted);
  const mediaChoices = useMediaChoices();

  useEffect(() => {
    mediaChoices?.saveAudioInputEnabled(audioInputEnabled);
    mediaChoices?.saveVideoInputEnabled(videoInputEnabled);
  }, [mediaChoices?.saveAudioInputEnabled, mediaChoices?.saveVideoInputEnabled]);

  const roomOptions = useMemo(
    () =>
      ({
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
      }) as RoomOptions,
    [keyProvider, worker, e2eeEnabled]
  );

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

  useLivekitEvents(room, isWhisperRoom);

  return room;
};

export default useRoom;
