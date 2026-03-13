// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Typography, Button, Grid, Stack, Box } from '@mui/material';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';

import { finish } from '../../../api/types/outgoing/poll';
import { LegalBallotIcon } from '../../../assets/icons';
import { ProgressBar } from '../../../commonComponents';
import { useAppDispatch, useDateFormat } from '../../../hooks';
import { Poll } from '../../../store/slices/pollSlice';
import { setVoteOrPollIdToShow } from '../../../store/slices/uiSlice';
import VoteAndPollCountdown from '../../VoteAndPollCountdown';

const MainContainer = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.background.customPaper.primary,
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: theme.borderRadius.medium,
}));

const Divider = styled('div')(({ theme }) => ({
  borderTop: `3px solid ${theme.palette.divider}`,
}));

const VoteState = styled('div')<{ state?: 'active' | 'finished' }>(({ theme, state }) => ({
  backgroundColor: state === 'active' ? theme.palette.success.main : theme.palette.error.main,
  padding: theme.spacing(0.5),
  fontWeight: 'bold',
}));

const TopicTypography = styled(Typography)({
  wordBreak: 'break-word',
});

interface IPollOverviewPanelProps {
  poll: Poll;
}

const PollOverviewPanel = ({ poll }: IPollOverviewPanelProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const startTime = new Date(poll.startTime);
  const formattedTime = useDateFormat(new Date(poll.startTime), 'time');

  const handleEnd = () => {
    dispatch(
      finish.action({
        id: poll.id,
      })
    );
  };

  const getVotedNumber = () => poll.results.reduce((acc, result) => acc + result.count, 0);

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
          <VoteState state={poll.state}>{t(`poll-overview-panel-status-${poll.state}`)}</VoteState>
          <Typography
            sx={{
              ml: 1,
            }}
          >
            {formattedTime}
          </Typography>
        </Box>
        {poll.duration > 0 && (
          <VoteAndPollCountdown
            duration={poll.duration}
            startTime={poll.startTime}
            active={poll.state === 'active'}
            flex={1}
            justifyContent="flex-end"
          />
        )}
      </Box>
      <Stack spacing={1}>
        <ProgressBar
          endTime={startTime.getTime() + (poll.duration ? poll.duration : 0) * 1000}
          startTime={startTime.getTime()}
          isFinished={Boolean(poll.state !== 'active')}
        />
        <Divider />
        <TopicTypography variant="body2" align="center">
          {truncate(poll.topic, { length: 120 })}
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
            {getVotedNumber()}
          </Typography>
        </Box>

        <Divider />

        {poll.state === 'active' && (
          <Grid sx={{ marginLeft: 'auto' }}>
            <Button size="small" variant="contained" onClick={handleEnd} color="secondary">
              {t('poll-overview-panel-button-end')}
            </Button>
          </Grid>
        )}
        {poll.state === 'finished' && (
          <Button
            size="small"
            variant="text"
            onClick={() => dispatch(setVoteOrPollIdToShow(poll.id))}
            color="secondary"
          >
            {t('poll-form-popover-results-button')}
          </Button>
        )}
      </Stack>
    </MainContainer>
  );
};

export default PollOverviewPanel;
