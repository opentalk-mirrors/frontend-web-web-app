// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { XORCipher } from '@opentalk/redux-oidc';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { isE2EESupported } from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAppSelector } from '.';
import { useGetRoomEventInfoQuery } from '../api/rest';
import { selectLivekitE2EESalt } from '../store/slices/configSlice';
import { useInviteCode } from './useInviteCode';

const useE2EE = () => {
  const [worker, setWorker] = useState<Worker | null>(null);
  const inviteCode = useInviteCode();
  const e2eeSalt = useAppSelector(selectLivekitE2EESalt);

  const { roomId } = useParams<'roomId'>() as {
    roomId: RoomId;
  };
  const { data: roomData } = useGetRoomEventInfoQuery({ id: roomId, inviteCode: inviteCode }, { skip: !roomId });

  const e2eePassphrase = useMemo(
    () => XORCipher.handle(`${roomData?.id}${roomData?.roomId}${e2eeSalt || ''}`),
    [roomData, e2eeSalt]
  );

  useEffect(() => {
    if (roomData?.e2EEncryption && !worker && e2eePassphrase) {
      const newWorker = new Worker(new URL('livekit-client/e2ee-worker', import.meta.url));
      setWorker(newWorker);
    }
    return () => {
      worker?.terminate();
      setWorker(null);
    };
  }, [e2eePassphrase, roomData?.e2EEncryption]);

  const e2eeEnabled = useMemo(() => {
    return (roomData?.e2EEncryption || false) && !!(e2eePassphrase && worker) && isE2EESupported();
  }, [roomData, e2eePassphrase, worker]);

  return { worker, e2eePassphrase, e2eeEnabled };
};

export default useE2EE;
