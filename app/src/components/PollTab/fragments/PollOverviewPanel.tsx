// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Container, Typography, Button, Grid, Divider } from '@mui/material';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';

import { finish } from '../../../api/types/outgoing/poll';
import { LegalBallotIcon } from '../../../assets/icons';
import { ProgressBar } from '../../../commonComponents';
import { useAppDispatch, useDateFormat } from '../../../hooks';
import { Poll } from '../../../store/slices/pollSlice';
import VoteAndPollCountdown from '../../VoteAndPollCountdown';

const MainContainer = styled(Container)(({ theme }) => ({
  backgroundColor: theme.palette.background.customPaper.primary,
  color: theme.palette.text.primary,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1),
  borderRadius: '0.4rem',
  gap: theme.spacing(1),
}));

const VoteCountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

const VoteState = styled('div')<{ state?: 'active' | 'finished' }>(({ theme, state }) => ({
  backgroundColor: state === 'active' ? theme.palette.success.main : theme.palette.error.main,
  color: state === 'active' ? theme.palette.success.contrastText : theme.palette.error.contrastText,
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
    <MainContainer>
      <Grid
        container
        spacing={1}
        sx={{
          justifyContent: 'center',
        }}
      >
        <Grid size="grow">
          <Grid
            container
            spacing={1}
            sx={{
              alignItems: 'end',
            }}
          >
            <Grid>
              <VoteState state={poll.state}>{t(`poll-overview-panel-status-${poll.state}`)}</VoteState>
            </Grid>
            <Grid>
              <Typography>{formattedTime}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid sx={{ display: 'flex' }}>
          <Grid
            container
            spacing={1}
            sx={{
              alignItems: 'flex-end',
            }}
          >
            {poll.duration && poll.duration > 0 && (
              <VoteAndPollCountdown
                duration={poll.duration}
                startTime={poll.startTime}
                active={poll.state === 'active'}
                flex={1}
                justifyContent="flex-end"
              />
            )}
          </Grid>
        </Grid>
        <Grid
          size={{ xs: 12 }}
          sx={{
            display: 'block',
          }}
        >
          <ProgressBar
            endTime={startTime.getTime() + (poll.duration ? poll.duration : 0) * 1000}
            startTime={startTime.getTime()}
            isFinished={Boolean(poll.state !== 'active')}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Divider />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TopicTypography variant="body2" align="center">
            {truncate(poll.topic, { length: 120 })}
          </TopicTypography>
        </Grid>
        <Grid>
          <VoteCountContainer>
            <LegalBallotIcon />
            {getVotedNumber()}
          </VoteCountContainer>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Divider />
        </Grid>
        {poll.state === 'active' && (
          <Grid sx={{ marginLeft: 'auto' }}>
            <Button size="small" variant="contained" onClick={handleEnd} color="secondary">
              {t('poll-overview-panel-button-end')}
            </Button>
          </Grid>
        )}
      </Grid>
    </MainContainer>
  );
};

export default PollOverviewPanel;
