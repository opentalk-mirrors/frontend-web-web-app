// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Grid, IconButton } from '@mui/material';
import { FC, FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { vote as sendPollChoiceToAPI, UserChoice } from '../../../api/types/outgoing/poll';
import { CloseIcon } from '../../../assets/icons';
import { useAppDispatch, useDateFormat } from '../../../hooks';
import { Poll, voted } from '../../../store/slices/pollSlice';
import { ChoiceId } from '../../../types';
import VoteAndPollCountdown from '../../VoteAndPollCountdown';
import { ActiveStateChip } from './ActiveStateChip';
import { Fieldset } from './Fieldset';
import { LegendTitle } from './LegendTitle';
import { LiveIndicator } from './LiveIndicator';
import VoteResult from './VoteResult';
import { VoteType } from './constants';

type PollContainerProps = {
  poll: Poll;
  onClose(): void;
};

const isChoiceIncludedPredicate = (choiceId: ChoiceId, userSelection?: UserChoice) => {
  const choice = userSelection && (userSelection.choiceId === choiceId || userSelection.choiceIds?.includes(choiceId));
  return Boolean(choice);
};

export const PollContainer: FC<PollContainerProps> = ({ poll, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [userSelection, setUserSelection] = useState<UserChoice>();

  const isPollActive = poll.state === 'active';

  const submittedPollOption = poll.voted;
  const isSubmitButtonDisabled = submittedPollOption || userSelection === undefined;

  const initialSum = 0;
  const numberOfVotes = poll.results?.reduce((sum, result) => sum + result.count, initialSum) || initialSum;
  const formattedTime = useDateFormat(new Date(poll.startTime), 'time');

  useEffect(() => {
    //For the case of live poll and user whose choice is not submit yet
    if (isPollActive && !submittedPollOption) {
      return;
    }
    setUserSelection(undefined);
  }, [poll]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (userSelection) {
      const pollId = poll.id;
      dispatch(sendPollChoiceToAPI.action({ pollId, ...userSelection }));
      dispatch(voted({ pollId, choice: userSelection }));
    }
  };

  const handleSingleChoiceSelect = (choiceId: ChoiceId) => {
    setUserSelection({ choiceId });
  };

  const handleMultipleChoiceSelect = (choiceId: ChoiceId) => {
    setUserSelection((state) => {
      const choiceIds = state?.choiceIds || [];

      if (choiceIds.includes(choiceId)) {
        const newChoiceList = choiceIds.filter((id) => id !== choiceId);
        //If list is empty we reset selection to undefined
        if (newChoiceList.length === 0) {
          return undefined;
        }
        return { choiceIds: newChoiceList };
      }

      return { choiceIds: [...choiceIds, choiceId] };
    });
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
              label={t(`poll-overview-panel-status-${poll?.state}`)}
              color={isPollActive ? 'success' : 'error'}
              variant="filled"
              clickable={false}
            />
            <Box>{formattedTime}</Box>
            {typeof poll.duration === 'number' && (
              <VoteAndPollCountdown
                duration={poll.duration}
                startTime={poll.startTime}
                active={poll.state === 'active'}
              />
            )}
          </Box>
          <IconButton
            onClick={onClose}
            aria-label={t('global-close-dialog')}
            /* eslint-disable jsx-a11y/no-autofocus */
            autoFocus
            edge="end"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Grid>
      <Grid component="form" container size={{ xs: 12 }} onSubmit={handleSubmit}>
        <Grid size={{ xs: 12 }}>
          <Fieldset>
            <legend>
              <LegendTitle variant="body1" component="h4">
                {poll.topic}
              </LegendTitle>
            </legend>
            <LiveIndicator isLive={poll.live} />
            {poll.choices.map((choice, index) => {
              const result = poll.results.find((result) => result.id === choice.id);

              const temporaryUserSelection = isChoiceIncludedPredicate(choice.id, userSelection);
              const voteInFinishedPoll = isChoiceIncludedPredicate(choice.id, poll.selectedChoice);
              const isSelected = voteInFinishedPoll || temporaryUserSelection;

              return (
                <VoteResult
                  key={index}
                  voteType={VoteType.Poll}
                  title={choice.content}
                  optionIndex={index}
                  voteData={{
                    votePercentage: result !== undefined ? (result.count / numberOfVotes) * 100 : 0,
                    numberOfVotes,
                    currentVotes: result !== undefined ? result.count : 0,
                    isVotable: isPollActive,
                    voteId: poll.id,
                  }}
                  isChecked={isSelected}
                  multipleChoice={poll.multipleChoice}
                  onVote={() => {
                    poll.multipleChoice ? handleMultipleChoiceSelect(choice.id) : handleSingleChoiceSelect(choice.id);
                  }}
                  showResult={poll.live || poll.state === 'finished'}
                />
              );
            })}
          </Fieldset>
        </Grid>
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
            color="secondary"
          >
            {t('global-submit')}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};
