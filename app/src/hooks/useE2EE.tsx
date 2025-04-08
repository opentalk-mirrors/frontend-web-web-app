// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { XORCipher } from '@opentalk/redux-oidc';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { isE2EESupported } from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';

import { useAppSelector } from '.';
import { useGetRoomEventInfoQuery } from '../api/rest';
import { selectLivekitE2EESalt } from '../store/slices/configSlice';
import { useInviteCode } from './useInviteCode';

export interface E2EEData {
  mainWorker: Worker | null;
  whisperWorker: Worker | null;
  e2eePassphrase: string;
  e2eeEnabled: boolean;
}

const useWorker = (e2eePassphrase: string, e2eEncryption?: boolean) => {
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    if (e2eEncryption && !worker && e2eePassphrase) {
      const newWorker = new Worker(new URL('livekit-client/e2ee-worker', import.meta.url));
      setWorker(newWorker);
    }
    return () => {
      worker?.terminate();
      setWorker(null);
    };
  }, [e2eePassphrase, e2eEncryption]);

  return worker;
};

const useE2EE = (roomId: RoomId): E2EEData => {
  const inviteCode = useInviteCode();
  const e2eeSalt = useAppSelector(selectLivekitE2EESalt);

  const { data: roomData } = useGetRoomEventInfoQuery({ id: roomId, inviteCode: inviteCode }, { skip: !roomId });

  const e2eePassphrase = useMemo(
    () => XORCipher.handle(`${roomData?.id}${roomData?.roomId}${e2eeSalt || ''}`),
    [roomData, e2eeSalt]
  );

  const mainWorker = useWorker(e2eePassphrase, roomData?.e2eEncryption);
  const whisperWorker = useWorker(e2eePassphrase, roomData?.e2eEncryption);

  const e2eeEnabled = useMemo(() => {
    return (roomData?.e2eEncryption || false) && !!(e2eePassphrase && mainWorker) && isE2EESupported();
  }, [roomData, e2eePassphrase, mainWorker]);

  return { mainWorker, whisperWorker, e2eePassphrase, e2eeEnabled };
};

export default useE2EE;
