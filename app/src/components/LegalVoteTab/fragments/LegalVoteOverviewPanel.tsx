// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Stack, Typography, Button, Box } from '@mui/material';
import { truncate } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { cancel, stop } from '../../../api/types/outgoing/legalVote';
import { LegalBallotIcon } from '../../../assets/icons';
import { ProgressBar } from '../../../commonComponents';
import { useDateFormat } from '../../../hooks';
import { LegalVoteState, LegalVote } from '../../../types';
import { getCurrentTimezone } from '../../../utils/timeFormatUtils';
import VoteAndPollCountdown from '../../VoteAndPollCountdown';

const MainContainer = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: '0.4rem',
}));

const Divider = styled('div')({
  borderTop: '3px solid #193a47',
});

const VoteState = styled('div')<{ state: LegalVoteState }>(({ theme, state }) => ({
  backgroundColor: state === LegalVoteState.Started ? theme.palette.success.main : theme.palette.error.main,
  padding: theme.spacing(0.5),
  fontWeight: 'bold',
}));

const ButtonContainer = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

const TopicTypography = styled(Typography)({
  wordBreak: 'break-word',
});

interface LegalVoteOverviewPanelProps {
  vote: LegalVote;
}

const LegalVoteOverviewPanel = ({
  vote: { id, duration, votingRecord, state, startTime, name, topic, allowedParticipants },
}: LegalVoteOverviewPanelProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [dispatchTriggered, setDispatchTriggered] = useState(false);

  const handleCancel = () => {
    if (dispatchTriggered) {
      return;
    }

    setDispatchTriggered(true);

    dispatch(
      cancel.action({
        legalVoteId: id,
        reason: 'Testing reasons',
        timezone: getCurrentTimezone(),
      })
    );
  };

  const handleEnd = () => {
    if (dispatchTriggered) {
      return;
    }

    setDispatchTriggered(true);

    dispatch(
      stop.action({
        legalVoteId: id,
        timezone: getCurrentTimezone(),
      })
    );
  };

  const localStartTimeAsDate = new Date(startTime);
  const endTime = localStartTimeAsDate.getTime() + (duration ? duration : 0) * 1000;
  const formattedStartTime = useDateFormat(localStartTimeAsDate, 'time');
  const getVotedNumber = () => (votingRecord !== undefined ? Object.keys(votingRecord).length : 0);
  const MAX_TOPIC_LENGTH = 120;

  return (
    <MainContainer spacing={2}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <VoteState state={state}>{t(`ballot-overview-panel-status-${state}`)}</VoteState>
          <Typography
            sx={{
              ml: 1,
            }}
          >{`${formattedStartTime}`}</Typography>
        </Box>
        {duration && duration > 0 && (
          <VoteAndPollCountdown
            duration={duration}
            startTime={startTime}
            active={state === LegalVoteState.Started}
            flex={1}
            justifyContent="flex-end"
          />
        )}
      </Box>
      <Stack spacing={1}>
        {duration && (
          <ProgressBar
            endTime={endTime}
            startTime={localStartTimeAsDate.getTime()}
            isFinished={Boolean(state !== LegalVoteState.Started)}
          />
        )}
        <Divider />
        <Typography noWrap align="center">
          {name}
        </Typography>
        <TopicTypography variant="body2" align="center">
          {truncate(topic, { length: MAX_TOPIC_LENGTH })}
        </TopicTypography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <LegalBallotIcon />
          <Typography
            sx={{
              ml: 0.5,
            }}
          >
            {getVotedNumber()}/{allowedParticipants.length || 0}
          </Typography>
        </Box>
        {state === LegalVoteState.Started && (
          <>
            <Divider />
            <ButtonContainer>
              <Button size="small" variant="text" onClick={handleCancel} disabled={dispatchTriggered}>
                {t('legal-vote-overview-panel-button-cancel')}
              </Button>
              <Button size="small" variant="contained" onClick={handleEnd} disabled={dispatchTriggered}>
                {t('legal-vote-overview-panel-button-end')}
              </Button>
            </ButtonContainer>
          </>
        )}
      </Stack>
    </MainContainer>
  );
};

export default LegalVoteOverviewPanel;
