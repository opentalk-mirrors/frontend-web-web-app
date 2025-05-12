// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaDeviceSelect } from '@livekit/components-react';
import { LocalAudioTrack, createLocalAudioTrack } from 'livekit-client';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { notifications } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import log from '../../../logger';
import { EchoTest, EchoTestState } from '../../../modules/WebRTC/EchoTest';
import { startMedia } from '../../../store/commonActions';
import {
  selectAudioDeviceId,
  selectAudioEnabled,
  setAudioDeviceId,
  setMediaChangeInProgress,
} from '../../../store/slices/mediaSlice';
import { handleMediaPermissionError } from '../../../utils/mediaErrorUtils';

interface EchoPlayBackProps {
  localAudioTrack?: LocalAudioTrack;
  setLocalAudioTrack: (audioTrack: LocalAudioTrack | undefined) => void;
}

const EchoPlayBack = ({ localAudioTrack, setLocalAudioTrack }: EchoPlayBackProps) => {
  const { t } = useTranslation();
  const audioEnabled = useAppSelector(selectAudioEnabled);
  const audioDeviceId = useAppSelector(selectAudioDeviceId);

  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useAppDispatch();

  const { activeDeviceId } = useMediaDeviceSelect({
    kind: 'audioinput',
    requestPermissions: false,
  });

  const changeHandler = useCallback(
    (instance: EchoTest) => (echoTestState: EchoTestState) => {
      switch (echoTestState) {
        case 'connected':
          break;
        case 'streamUpdate':
          if (audioRef.current) {
            audioRef.current.srcObject = instance.outStream || null;
          } else {
            log.error('No audio element found.');
          }
          break;
        case 'closed':
          if (audioRef.current) {
            audioRef.current.srcObject = null;
          }
          break;
        default:
          log.error('Unknown state change');
      }
    },
    []
  );

  useEffect(() => {
    if (audioEnabled || activeDeviceId !== audioDeviceId) {
      dispatch(setMediaChangeInProgress('audioinput'));
      createLocalAudioTrack({ deviceId: audioDeviceId })
        .then((audioTrack) => {
          setLocalAudioTrack(audioTrack);
          const usedDeviceId = audioTrack.constraints.deviceId as string;
          if (usedDeviceId !== audioDeviceId) {
            dispatch(setAudioDeviceId(usedDeviceId));
          }
        })
        .catch((error) => {
          dispatch(startMedia({ kind: 'audioinput', enabled: false }));
          handleMediaPermissionError({ error, deviceId: audioDeviceId, kind: 'audioinput' });
        })
        .finally(() => {
          dispatch(setMediaChangeInProgress(null));
        });
    }
  }, [setLocalAudioTrack, activeDeviceId, audioDeviceId]);

  useEffect(() => {
    if (!localAudioTrack?.mediaStreamTrack) {
      return;
    }

    const audioTrackSettings = localAudioTrack.mediaStreamTrack.getSettings();

    if (!audioTrackSettings.echoCancellation) {
      notifications.warning(t('echotest-warn-no-echo-cancellation'), { persist: true });
    }

    const echoTest = new EchoTest();
    const echoChangeHandler = changeHandler(echoTest);
    echoTest.addEventListener('stateChanged', echoChangeHandler);
    localAudioTrack.mediaStream &&
      echoTest.connect(localAudioTrack.mediaStream).catch((e) => {
        log.error('Failed to connect EchoTest', e);
      });

    return () => {
      localAudioTrack.mediaStreamTrack.stop();
      echoTest.close();
      echoTest.removeEventListener('stateChanged', echoChangeHandler);
    };
  }, [localAudioTrack?.mediaStreamTrack, localAudioTrack?.mediaStream, changeHandler, t]);

  return (
    <audio ref={audioRef} autoPlay>
      <track kind="captions" />
    </audio>
  );
};

export default EchoPlayBack;
