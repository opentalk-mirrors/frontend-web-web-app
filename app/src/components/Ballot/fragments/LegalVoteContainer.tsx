// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Grid, IconButton, Typography } from '@mui/material';
import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { vote } from '../../../api/types/outgoing/legalVote';
import { CloseIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector, useDateFormat } from '../../../hooks';
import { selectPersistedToken } from '../../../store/slices/legalVoteSlice';
import { LegalVoteKind, LegalVoteState, LegalVote, LegalVoteOption } from '../../../types';
import { getCurrentTimezone } from '../../../utils/timeFormatUtils';
import LegalVoteCountdown from '../../LegalVoteCountdown';
import { LegalVoteTokenClipboard } from '../../LegalVoteTokenClipboard';
import { ActiveStateChip } from './ActiveStateChip';
import { Fieldset } from './Fieldset';
import { LegendTitle } from './LegendTitle';
import VoteResult from './VoteResult';
import VoteResultDate from './VoteResultDate';
import VoteResultTable from './VoteResultTable';
import { VoteType } from './constants';

type LegalVoteContainerProps = {
  legalVote: LegalVote;
  onClose(): void;
  isAllowedToVote: boolean;
};

// Table is visible for all users who can vote in role_call and live_roll_call (by name)
// button is visible only in the hidden kind of the legal vote
// button in the hidden mode can be seen only after finishing the vote

export const LegalVoteContainer: FC<LegalVoteContainerProps> = ({ legalVote, onClose, isAllowedToVote }) => {
  const { t } = useTranslation();
  const fallbackToken = useAppSelector(selectPersistedToken);
  const token = legalVote.token || fallbackToken;
  const isLegalVoteActive = legalVote.state === LegalVoteState.Started;
  const formattedTime = useDateFormat(new Date(legalVote.startTime), 'time');
  const initialSum = 0;
  const numberOfVotes = Object.values(legalVote.votes || {}).reduce(function sumVotes(sum, totalVotesForCurrentOption) {
    return sum + totalVotesForCurrentOption;
  }, initialSum);
  const [localSelectedLegalVoteOption, setLocalSelectedLegalVoteOption] = useState<LegalVoteOption | undefined>(
    legalVote.userVote?.selectedOption
  );
  const isOptionDisabled = Boolean(!isLegalVoteActive || !isAllowedToVote || legalVote.userVote?.votedAt || !token);
  // you can't vote if vote is not active or you are not selected or you already voted.
  const isSubmitButtonDisabled = Boolean(
    !isLegalVoteActive || !isAllowedToVote || legalVote.userVote?.votedAt || !localSelectedLegalVoteOption || !token
  );
  useEffect(
    function resetSelectedLegalVoteOptionOnLegalVoteIdChange() {
      setLocalSelectedLegalVoteOption(legalVote.userVote?.selectedOption);
    },
    [legalVote.id, legalVote.userVote?.selectedOption]
  );
  const hasVotes = Object.keys(legalVote.votingRecord || {}).length > 0;
  const isTableHintVisible =
    legalVote.kind === LegalVoteKind.Pseudonymous && isAllowedToVote && !isLegalVoteActive && hasVotes;
  const [showResults, setShowResults] = useState(false);
  const showResultTable = (legalVote.kind !== LegalVoteKind.Pseudonymous || showResults) && isAllowedToVote && hasVotes;
  const showTokenClipboard = legalVote.state === LegalVoteState.Finished && isAllowedToVote && token;
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollTo({ behavior: 'smooth' });
    }
  };
  const dispatch = useAppDispatch();

  const submitLegalVoteOption = (event: FormEvent) => {
    event.preventDefault();
    if (!legalVote || !legalVote.id || !localSelectedLegalVoteOption) {
      return;
    }
    dispatch(
      vote.action({
        legalVoteId: legalVote.id,
        option: localSelectedLegalVoteOption,
        token: token || '',
        timezone: getCurrentTimezone(),
      })
    );
  };

  const calculateVotePercentage = (legalVote: LegalVote, voteKey: LegalVoteOption): number => {
    return legalVote.votes && legalVote.votes[voteKey] != 0 ? (legalVote.votes[voteKey] / numberOfVotes) * 100 : 0;
  };

  return (
    <Grid
      container
      rowSpacing={1.4}
      sx={{
        width: '100%',
      }}
    >
      <Grid size={{ xs: 12 }} style={{ scrollBehavior: 'smooth' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <ActiveStateChip
              size="medium"
              label={t(`ballot-overview-panel-status-${legalVote.state}`)}
              color={isLegalVoteActive ? 'success' : 'error'}
              variant="filled"
              clickable={false}
            />
            <Box>{formattedTime}</Box>
            {typeof legalVote.duration === 'number' && (
              <LegalVoteCountdown
                duration={legalVote.duration}
                startTime={legalVote.startTime}
                active={isLegalVoteActive}
              />
            )}
          </Box>
          <IconButton
            onClick={onClose}
            aria-label={t('global-close-dialog')}
            /* eslint-disable jsx-a11y/no-autofocus */
            autoFocus
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Grid>
      <Grid component="form" container size={{ xs: 12 }} onSubmit={submitLegalVoteOption}>
        <Grid size={{ xs: 12 }}>
          <Fieldset>
            <legend>
              <LegendTitle variant="h2" component="h3">
                {legalVote.name}
              </LegendTitle>
              {legalVote.subtitle && (
                <Typography variant="body1" component="h4">
                  {legalVote.subtitle}
                </Typography>
              )}
              {legalVote.topic && (
                <Typography variant="body1" component="h4">
                  {legalVote.topic}
                </Typography>
              )}
            </legend>
            <Grid size={{ xs: 12 }}>
              {legalVote.votes &&
                Object.keys(legalVote.votes).map(
                  (voteKey, index) =>
                    (voteKey !== 'abstain' || (voteKey === 'abstain' && legalVote.enableAbstain)) && (
                      <VoteResult
                        key={index}
                        title={t(`legal-vote-${voteKey}-label`)}
                        optionIndex={index}
                        voteType={VoteType.LegalVote}
                        voteData={{
                          votePercentage: calculateVotePercentage(legalVote, voteKey as LegalVoteOption),
                          numberOfVotes,
                          currentVotes: legalVote.votes ? legalVote.votes[voteKey as LegalVoteOption] : 0,
                          isVotable: !isOptionDisabled,
                          voteId: legalVote.id,
                        }}
                        isChecked={voteKey === localSelectedLegalVoteOption}
                        onVote={() => {
                          setLocalSelectedLegalVoteOption(voteKey as LegalVoteOption);
                        }}
                      />
                    )
                )}
            </Grid>
          </Fieldset>
        </Grid>
        {!isAllowedToVote && legalVote.allowedParticipants.length && (
          <Grid
            size={{ xs: 12 }}
            container
            sx={{
              justifyContent: 'flex-start',
              mt: 1,
            }}
          >
            <Typography
              color="primary"
              sx={{
                textAlign: 'center',
              }}
            >
              {t('legal-vote-not-selected')}
            </Typography>
          </Grid>
        )}
        {isAllowedToVote && (
          <Grid
            size={{ xs: 12 }}
            container
            sx={{
              my: 1,
              justifyContent: 'stretch',
            }}
          >
            <Button
              type="submit"
              disabled={isSubmitButtonDisabled}
              variant={isSubmitButtonDisabled ? 'conference-inactive' : 'contained'}
              fullWidth
            >
              {t('global-submit')}
            </Button>
          </Grid>
        )}
      </Grid>
      {legalVote.userVote?.votedAt && isAllowedToVote && (
        <Grid size={{ xs: 12 }}>
          <VoteResultDate
            date={new Date(legalVote.userVote?.votedAt)}
            state={legalVote.state}
            showTableHint={isTableHintVisible}
            showResultsHandler={() => setShowResults(true)}
          />
        </Grid>
      )}
      {showTokenClipboard && legalVote.userVote?.votedAt && (
        <Grid size={{ xs: 12 }}>
          <LegalVoteTokenClipboard
            name={legalVote.name}
            timestamp={legalVote.userVote?.votedAt}
            token={token}
            vote={t(`legal-vote-${localSelectedLegalVoteOption}-label`) as string}
          />
        </Grid>
      )}
      {showResultTable && (
        <Grid ref={resultsRef} size={{ xs: 12 }}>
          <VoteResultTable scrollToResults={scrollToResults} voteId={legalVote.id} />
        </Grid>
      )}
    </Grid>
  );
};
