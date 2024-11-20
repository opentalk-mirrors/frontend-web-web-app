// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useContext } from 'react';

import type { ExtendedFullScreenHandle } from '../provider/FullscreenProvider';
import { FullscreenContext } from '../provider/FullscreenProvider/FullscreenContext';

export const useFullscreenContext = (): ExtendedFullScreenHandle => {
  const contextValue = useContext(FullscreenContext);

  if (contextValue === null) {
    throw Error('Fullscreen context has not been Provided!');
  }

  return contextValue;
};
