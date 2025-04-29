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
import { startMedia } from '../store/commonActions';
import { setLivekitRoom } from '../store/livekitRoom';
import { selectAudioEnabled } from '../store/slices/mediaSlice';
import { selectShouldForceMuted } from '../store/slices/moderationSlice';
import { useAppDispatch, useAppSelector } from './useCustomRedux';
import { E2EEData } from './useE2EE';

interface IUseRoomOptions {
  e2eeData: E2EEData;
  isWhisperRoom?: boolean;
}

const useRoom = ({ e2eeData, isWhisperRoom }: IUseRoomOptions): Room | undefined => {
  const { t } = useTranslation();
  const keyProvider = useMemo(() => new ExternalE2EEKeyProvider(), []);
  const { mainWorker, whisperWorker, e2eePassphrase, e2eeEnabled } = e2eeData;
  const shouldForceMuted = useAppSelector(selectShouldForceMuted);
  const dispatch = useAppDispatch();
  const audioEnabled = useAppSelector(selectAudioEnabled);

  const worker = isWhisperRoom ? whisperWorker : mainWorker;

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
        // adaptiveStream: true,
        adaptiveStream: { pixelDensity: 'screen' },
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
    return roomInstance;
  }, [roomOptions]);

  useEffect(() => {
    if (!isWhisperRoom && room) {
      setLivekitRoom(room, dispatch);
    }
    // Mutes the user if microphones are disabled in conference
    if (shouldForceMuted && audioEnabled) {
      dispatch(startMedia({ kind: 'audioinput', enabled: false }));
    }
  }, [room, isWhisperRoom]);

  useEffect(() => {
    if (e2eeEnabled && !room.isE2EEEnabled) {
      keyProvider.setKey(e2eePassphrase);
      room.setE2EEEnabled(true).catch((e) => {
        if (e instanceof DeviceUnsupportedError) {
          notifications.error(t('unsupported-browser-e2e-encryption-dialog-message'));
        }
      });
    }
  }, [e2eeEnabled, room]);

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

  return room;
};

export default useRoom;
