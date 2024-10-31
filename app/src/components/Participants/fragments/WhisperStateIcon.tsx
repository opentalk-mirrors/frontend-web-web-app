// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useCallback } from 'react';

import { WhisperEmptyIcon, WhisperFullIcon } from '../../../assets/icons';
import { WhisperParticipantState } from '../../../types';

interface WhisperStateIconProps {
  state?: WhisperParticipantState;
}

function WhisperStateIcon({ state }: WhisperStateIconProps) {
  const getWhisperStateIcon = useCallback(() => {
    switch (state) {
      case WhisperParticipantState.Invited:
        return <WhisperEmptyIcon />;
      case WhisperParticipantState.Accepted:
        return <WhisperFullIcon />;
      case WhisperParticipantState.Creator:
        return <WhisperFullIcon />;
      default:
        return null;
    }
  }, [state]);
  return getWhisperStateIcon();
}

export default WhisperStateIcon;
