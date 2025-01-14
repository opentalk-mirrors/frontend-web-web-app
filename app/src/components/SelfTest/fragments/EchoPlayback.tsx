// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaDeviceSelect } from '@livekit/components-react';
import { LocalAudioTrack, createLocalAudioTrack } from 'livekit-client';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { notifications } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { EchoTest, EchoTestState } from '../../../modules/WebRTC/EchoTest';
import {
  selectAudioEnabled,
  selectAudioDeviceId,
  setAudioDeviceId,
  setAudioEnabled,
} from '../../../store/slices/mediaSlice';

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
            console.error('No audio element found.');
          }
          break;
        case 'closed':
          if (audioRef.current) {
            audioRef.current.srcObject = null;
          }
          break;
        default:
          console.error('Unknown state change');
      }
    },
    []
  );

  useEffect(() => {
    if (audioEnabled || activeDeviceId !== audioDeviceId) {
      createLocalAudioTrack({ deviceId: audioDeviceId })
        .then((audioTrack) => {
          setLocalAudioTrack(audioTrack);
          const usedDeviceId = audioTrack.constraints.deviceId as string;
          if (usedDeviceId !== audioDeviceId) {
            dispatch(setAudioDeviceId(usedDeviceId));
          }
        })
        .catch((err) => {
          dispatch(setAudioEnabled(false));
          if (err.name !== 'NotAllowedError') {
            console.error('Error while publishing audio track: ', err);
          }
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
        console.error('Failed to connect EchoTest', e);
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
