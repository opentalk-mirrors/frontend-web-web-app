// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';

import { useAppSelector } from '../../hooks';
import { selectIsModuleEnabled } from '../../store/slices/configSlice';
import { selectFloatingReactions } from '../../store/slices/reactionSlice';
import FloatingReactionItem from './FloatingReactionItem';

const Overlay = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: '50%',
  width: '33%',
  pointerEvents: 'none',
  zIndex: 1,
});

const FloatingReactionsOverlay = () => {
  const reactionModuleEnabled = useAppSelector(selectIsModuleEnabled(BackendModules.Reaction));
  const floatingReactions = useAppSelector(selectFloatingReactions);

  if (!reactionModuleEnabled) {
    return null;
  }

  return (
    <Overlay aria-live="polite">
      {floatingReactions.map((reaction) => (
        <FloatingReactionItem
          key={`${reaction.timestamp}-${reaction.participantId}`}
          participantId={reaction.participantId}
          reaction={reaction.reaction}
        />
      ))}
    </Overlay>
  );
};

export default FloatingReactionsOverlay;
