// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LocalUserChoices } from '@livekit/components-core';
import { usePersistentUserChoices } from '@livekit/components-react';
import { createContext, useContext } from 'react';

interface MediachoicesValues {
  userChoices: LocalUserChoices;
  saveAudioInputEnabled: (isEnabled: boolean) => void;
  saveVideoInputEnabled: (isEnabled: boolean) => void;
  saveAudioInputDeviceId: (deviceId: string) => void;
  saveVideoInputDeviceId: (deviceId: string) => void;
  saveUsername: (username: string) => void;
}

const MediaChoicesContext = createContext<MediachoicesValues | undefined>(undefined);

const MediaChoicesProvider = ({ children }: { children: React.ReactNode }) => {
  const mediaChoicesState = usePersistentUserChoices({
    defaults: {
      audioEnabled: false,
      videoEnabled: false,
    },
  });

  return <MediaChoicesContext.Provider value={mediaChoicesState}>{children}</MediaChoicesContext.Provider>;
};

export const useMediaChoices = () => {
  return useContext(MediaChoicesContext);
};

export default MediaChoicesProvider;
