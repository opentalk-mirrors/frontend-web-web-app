// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Container, Typography, Button, Grid } from '@mui/material';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';

import { finish } from '../../../api/types/outgoing/poll';
import { DurationIcon, LegalBallotIcon } from '../../../assets/icons';
import { ProgressBar } from '../../../commonComponents';
import { useAppDispatch, useDateFormat } from '../../../hooks';
import { Poll } from '../../../store/slices/pollSlice';

const MainContainer = styled(Container)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
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

const Divider = styled('div')({
  borderTop: '3px solid #193a47',
});

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

  const formatDuration = (timestamp: number) => {
    const seconds = timestamp % 60;
    const minutes = timestamp / 60;
    const minuteTimestamp = minutes < 10 ? `0${minutes}` : minutes;
    const secondTimestamp = seconds < 10 ? `0${seconds}` : seconds;
    return `${minuteTimestamp}:${secondTimestamp}`;
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
        <Grid item xs>
          <Grid
            container
            spacing={1}
            sx={{
              alignItems: 'end',
            }}
          >
            <Grid item>
              <VoteState state={poll.state}>{t(`poll-overview-panel-status-${poll.state}`)}</VoteState>
            </Grid>
            <Grid item>
              <Typography>{formattedTime}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item sx={{ display: 'flex' }}>
          <Grid
            container
            spacing={1}
            sx={{
              alignItems: 'flex-end',
            }}
          >
            <Grid item>
              <DurationIcon />
            </Grid>
            <Grid item>
              <Typography>
                {poll.duration && poll.duration > 60 ? formatDuration(poll.duration) : poll.duration}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
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
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item zeroMinWidth xs={12}>
          <TopicTypography variant="body2" align="center">
            {truncate(poll.topic, { length: 120 })}
          </TopicTypography>
        </Grid>
        <Grid item>
          <VoteCountContainer>
            <LegalBallotIcon />
            {getVotedNumber()}
          </VoteCountContainer>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        {poll.state === 'active' && (
          <Grid item sx={{ marginLeft: 'auto' }}>
            <Button size="small" variant="contained" onClick={handleEnd}>
              {t('poll-overview-panel-button-end')}
            </Button>
          </Grid>
        )}
      </Grid>
    </MainContainer>
  );
};

export default PollOverviewPanel;
