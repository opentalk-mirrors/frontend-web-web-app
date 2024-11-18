// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useContext } from 'react';

import { MediaChoicesContext } from '../provider/MediaChoicesProvider/MediaChoicesContext';

export const useMediaChoices = () => {
  return useContext(MediaChoicesContext);
};
