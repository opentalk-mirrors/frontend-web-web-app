// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Table, TableBody, TableCell, TableHead, TableRow, styled } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../hooks';
import { selectVoteById } from '../../../store/slices/legalVoteSlice';
import type { LegalVoteId } from '../../../types';
import VoteEmptyRow from './VoteEmptyRow';
import VoteResultCountRow from './VoteResultCountRow';
import VoteResultRow from './VoteResultRow';

const CustomTable = styled(Table)(({ theme }) => ({
  '.MuiTableRow-head > .MuiTableCell-root': {
    backgroundColor: theme.palette.background.customPaper.primary,
  },
  '.MuiTableBody-root .MuiTableCell-root': {
    borderBottomColor: theme.palette.secondary.light,
  },
}));

interface VoteResultTableProps {
  voteId: LegalVoteId;
  scrollToResults: () => void;
}

function VoteResultTable(props: VoteResultTableProps) {
  const { t } = useTranslation();
  const vote = useAppSelector(selectVoteById(props.voteId));

  if (!vote || !vote.votes) {
    return null;
  }

  useEffect(() => {
    props.scrollToResults();
  }, [props.scrollToResults]);

  const participants = Object.entries(vote.votingRecord || {});
  const total = vote.votes.yes + vote.votes.no + vote.votes.abstain;

  return (
    <CustomTable stickyHeader={true}>
      <TableHead>
        <TableRow>
          <TableCell>{t('global-participants')}</TableCell>
          <TableCell>
            {t('legal-vote-yes-label')} ({vote.votes.yes || 0})
          </TableCell>
          <TableCell>
            {t('legal-vote-no-label')} ({vote.votes.no || 0})
          </TableCell>
          <TableCell>
            {t('legal-vote-abstain-label')} ({vote.votes.abstain || 0})
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {participants.length === 0 && <VoteEmptyRow />}
        {participants.map(([participantId, selectedVote]) => {
          return (
            <VoteResultRow
              key={participantId}
              participantId={vote.kind !== 'pseudonymous' ? participantId : ''}
              selectedVote={selectedVote}
              token={vote.kind === 'pseudonymous' ? participantId : ''}
            />
          );
        })}
        {participants.length !== 0 && <VoteResultCountRow total={total} />}
      </TableBody>
    </CustomTable>
  );
}

export default VoteResultTable;
