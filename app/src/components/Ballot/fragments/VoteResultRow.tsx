// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TableCell, TableRow, Typography } from '@mui/material';
import { memo } from 'react';

import { useAppSelector } from '../../../hooks';
import { selectUserAsParticipant } from '../../../store/selectors';
import { selectParticipantById } from '../../../store/slices/participantsSlice';
import { LegalVoteOption } from '../../../types';

interface VoteResultRowProps {
  participantId: string;
  selectedVote: LegalVoteOption;
  token: string;
}

function VoteResultRow(props: VoteResultRowProps) {
  const participant = useAppSelector(selectParticipantById(props.participantId.toLowerCase()));
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
      <TableCell>{props.selectedVote === 'yes' ? 'x' : null}</TableCell>
      <TableCell>{props.selectedVote === 'no' ? 'x' : null}</TableCell>
      <TableCell>{props.selectedVote === 'abstain' ? 'x' : null}</TableCell>
    </TableRow>
  );
}

export default memo(VoteResultRow);
