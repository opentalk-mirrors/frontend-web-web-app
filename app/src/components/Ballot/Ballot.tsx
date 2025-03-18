// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Dialog, styled, Paper } from '@mui/material';

import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  closedResultWindow as closedLegalVoteResultWindow,
  selectCurrentShownVoteId,
  selectVoteById,
} from '../../store/slices/legalVoteSlice';
import {
  selectPollIdToShow,
  closedResultWindow as closedPollResultWindow,
  selectPollById,
} from '../../store/slices/pollSlice';
import { selectVoteOrPollIdToShow, setVoteOrPollIdToShow } from '../../store/slices/uiSlice';
import { selectOurUuid } from '../../store/slices/userSlice';
import type { PollId, LegalVoteId } from '../../types';
import { LegalVoteContainer } from './fragments/LegalVoteContainer';
import { PollContainer } from './fragments/PollContainer';
import { ReportSection } from './fragments/ReportSection';
import { LEGEND_TITLE_ID } from './fragments/constants';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '1rem',
  background: theme.palette.background.voteResult,
  padding: theme.spacing(2),
}));

export default function Ballot() {
  const dispatch = useAppDispatch();
  const voteIdToShow = useAppSelector(selectCurrentShownVoteId);
  const pollIdToShow = useAppSelector(selectPollIdToShow);
  const voteOrPollIdToShow = useAppSelector(selectVoteOrPollIdToShow); // when user selects a vote to preview from the dropdown menu

  const pollToShow = useAppSelector(selectPollById((voteOrPollIdToShow ? voteOrPollIdToShow : pollIdToShow) as PollId));
  const legalVoteToShow = useAppSelector(
    selectVoteById((voteOrPollIdToShow ? voteOrPollIdToShow : voteIdToShow) as LegalVoteId)
  );
  const ourUuid = useAppSelector(selectOurUuid);
  const isAllowedToVote =
    ourUuid && legalVoteToShow ? Boolean(legalVoteToShow.allowedParticipants?.includes(ourUuid)) : false;

  const handleClose = () => {
    dispatch(setVoteOrPollIdToShow(undefined));
    dispatch(closedLegalVoteResultWindow());
    dispatch(closedPollResultWindow());
  };

  if (pollToShow) {
    return (
      <Dialog
        PaperComponent={StyledPaper}
        onClose={handleClose}
        open
        maxWidth="sm"
        fullWidth
        disableAutoFocus
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        slotProps={{ paper: { 'aria-modal': true, 'aria-labelledby': LEGEND_TITLE_ID } }}
      >
        <PollContainer onClose={handleClose} poll={pollToShow} />
      </Dialog>
    );
  }

  if (legalVoteToShow) {
    return (
      <Dialog
        PaperComponent={StyledPaper}
        onClose={handleClose}
        open
        maxWidth={false}
        fullWidth
        disableAutoFocus
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        slotProps={{ paper: { sx: { maxWidth: 700 }, 'aria-modal': true, 'aria-labelledby': LEGEND_TITLE_ID } }}
      >
        <LegalVoteContainer onClose={handleClose} legalVote={legalVoteToShow} isAllowedToVote={isAllowedToVote} />
        {isAllowedToVote && <ReportSection legalVoteId={legalVoteToShow.id} />}
      </Dialog>
    );
  }

  return null;
}
