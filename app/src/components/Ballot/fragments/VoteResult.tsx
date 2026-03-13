// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Radio, InputLabel, Checkbox as MuiCheckbox } from '@mui/material';
import { useState } from 'react';

import { useAppSelector } from '../../../hooks';
import { selectCurrentShownVote } from '../../../store/slices/legalVoteSlice';
import { selectPollToShow } from '../../../store/slices/pollSlice';
import { PollId, LegalVoteId } from '../../../types';
import { VoteType } from './constants';

export interface IVoteData {
  numberOfVotes: number;
  votePercentage: number;
  isVotable: boolean;
  voteId: LegalVoteId | PollId;
  currentVotes: number;
}

export interface IVoteResult {
  title: string;
  optionIndex: number;
  voteData: IVoteData;
  onVote: () => void;
  showResult?: boolean;
  isChecked?: boolean;
  voteType: VoteType;
  multipleChoice?: boolean;
}

const ResultLabel = styled(InputLabel)(({ theme }) => ({
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  paddingRight: theme.spacing(2),
}));

const ProgressContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  height: '3em',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.borderRadius.medium,
  marginTop: theme.spacing(1),
  '& .MuiInputLabel-root': {
    color: theme.palette.primary.contrastText,
    flex: 1,
    height: '100%',
    lineHeight: '3em',
    borderRadius: theme.borderRadius.medium,
  },
  '& .MuiRadio-root.MuiRadio-colorPrimary': {
    padding: theme.spacing(0.3),
    margin: theme.spacing(0, 1),

    aspectRatio: '1/1',
    color: theme.palette.primary.contrastText,
    '&.Mui-checked': {
      color: theme.palette.primary.contrastText,
    },
    '&.Mui-disabled': {
      opacity: 0.6,
    },
    '&.Mui-disabled + .MuiInputLabel-root': {
      color: theme.palette.primary.contrastText,
      opacity: 0.6,
    },
  },
  '& .MuiRadio-root:not(.Mui-disabled) + .MuiInputLabel-root': {
    cursor: 'pointer',
  },
}));

const Checkbox = styled(MuiCheckbox)(({ theme }) => ({
  '&.MuiButtonBase-root.MuiCheckbox-root.Mui-disabled': {
    color: theme.palette.primary.contrastText,
    opacity: 0.6,
  },
  '&.MuiButtonBase-root.MuiCheckbox-root': {
    color: theme.palette.primary.contrastText,
  },
}));

const ProgressLabel = styled('span')(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  display: 'flex',
  gap: '1em',
  marginRight: theme.spacing(2),
}));

const VoteResult = ({
  title,
  voteData,
  onVote,
  showResult = true,
  isChecked,
  voteType,
  optionIndex,
  multipleChoice,
}: IVoteResult) => {
  const currentLegalVote = useAppSelector(selectCurrentShownVote);
  const currentPoll = useAppSelector(selectPollToShow);
  const didVote =
    voteType === VoteType.LegalVote ? Boolean(currentLegalVote?.userVote?.votedAt) : Boolean(currentPoll?.voted);
  const id = voteData.voteId + '-' + optionIndex;
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  return (
    <ProgressContainer
      onMouseEnter={() => setShowAdditionalInfo(true)}
      onMouseLeave={() => setShowAdditionalInfo(false)}
    >
      {multipleChoice ? (
        <Checkbox id={id} disabled={didVote || !voteData.isVotable} checked={isChecked} onChange={onVote} />
      ) : (
        <Radio
          id={id}
          disabled={didVote || !voteData.isVotable}
          checked={isChecked}
          name={voteData.voteId}
          onChange={onVote}
        />
      )}
      <ResultLabel htmlFor={id}>{title}</ResultLabel>
      {showResult && (
        <ProgressLabel>
          {`${voteData.votePercentage ? voteData.votePercentage.toFixed(1) : 0}% ${
            showAdditionalInfo ? `${voteData.currentVotes} / ${voteData.numberOfVotes}` : ''
          }`}
        </ProgressLabel>
      )}
    </ProgressContainer>
  );
};

export default VoteResult;
