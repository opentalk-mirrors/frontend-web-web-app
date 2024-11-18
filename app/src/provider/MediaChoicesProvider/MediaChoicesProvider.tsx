// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { usePersistentUserChoices } from '@livekit/components-react';

import { MediaChoicesContext } from './MediaChoicesContext';

const MediaChoicesProvider = ({ children }: { children: React.ReactNode }) => {
  const mediaChoicesState = usePersistentUserChoices({
    defaults: {
      audioEnabled: false,
      videoEnabled: false,
    },
  });

  return <MediaChoicesContext.Provider value={mediaChoicesState}>{children}</MediaChoicesContext.Provider>;
};

export default MediaChoicesProvider;
