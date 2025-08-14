// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LocalAudioTrack } from 'livekit-client';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { notifications } from '../../../commonComponents';
import log from '../../../logger';
import { EchoTest, EchoTestState } from '../../../modules/WebRTC/EchoTest';

interface EchoPlayBackProps {
  localAudioTrack?: LocalAudioTrack;
}

const EchoPlayBack = ({ localAudioTrack }: EchoPlayBackProps) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);

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
    localAudioTrack.mediaStream && echoTest.connect(localAudioTrack.mediaStream);

    return () => {
      echoTest.close();
      echoTest.removeEventListener('stateChanged', echoChangeHandler);
    };
  }, [localAudioTrack?.mediaStreamTrack, t]);

  return (
    <audio ref={audioRef} autoPlay>
      <track kind="captions" />
    </audio>
  );
};

export default EchoPlayBack;
