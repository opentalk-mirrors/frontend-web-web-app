// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Box } from '@mui/material';
import { truncate } from 'es-toolkit/compat';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../hooks';
import { selectParticipantById } from '../../../store/slices/participantsSlice';
import type { ParticipantId } from '../../../types';
import HandRaisedIndicator from '../../HandRaisedIndicator';

const PositionedHandRaisedIndicator = styled(HandRaisedIndicator)({
  position: 'absolute',
  right: 5,
  bottom: 5,
});

const ParticipantHandRaisedIndicator = ({ participantId }: { participantId: ParticipantId }) => {
  const { t } = useTranslation();
  const participant = useAppSelector(selectParticipantById(participantId));

  const show = participant?.handIsUp && participant.handUpdatedAt;
  return (
    // The aria-live wrapper should be always mounted
    // That guarantees, that screenreaders realiably announce content update
    <Box role="alert" aria-live="assertive">
      {show && (
        <PositionedHandRaisedIndicator
          label={t('indicator-participant-has-raised-hand', {
            participantName: truncate(participant.displayName || '', { length: 100 }),
          })}
        />
      )}
    </Box>
  );
};

export default ParticipantHandRaisedIndicator;
