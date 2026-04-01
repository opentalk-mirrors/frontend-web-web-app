// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TableCell, TableRow, Typography } from '@mui/material';
import { memo } from 'react';

import { useAppSelector } from '../../../hooks';
import { selectUserAsParticipant } from '../../../store/selectors';
import { selectParticipantById } from '../../../store/slices/participantsSlice';
import { LegalVoteOption, ParticipantId } from '../../../types';

interface VoteResultRowProps {
  participantId: string;
  selectedVote: LegalVoteOption;
  token: string;
}

function VoteResultRow(props: VoteResultRowProps) {
  const participant = useAppSelector(selectParticipantById(props.participantId as ParticipantId));
  const user = useAppSelector(selectUserAsParticipant);
  const { token } = props;

  const participantLabel = token || (participant || user)?.displayName || '';

  return (
    <TableRow>
      <TableCell>
        <Typography
          noWrap
          component="span"
          sx={{ maxWidth: '150px', display: 'block' }}
          translate="no"
          title={participantLabel}
        >
          {participantLabel}
        </Typography>
      </TableCell>
      <TableCell align="center">{props.selectedVote === LegalVoteOption.Yes ? 'x' : null}</TableCell>
      <TableCell align="center">{props.selectedVote === LegalVoteOption.No ? 'x' : null}</TableCell>
      <TableCell align="center">{props.selectedVote === LegalVoteOption.Abstain ? 'x' : null}</TableCell>
    </TableRow>
  );
}

export default memo(VoteResultRow);
