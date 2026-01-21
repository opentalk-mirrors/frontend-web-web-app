// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button as MuiButton, styled, Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { stop, switchRoom } from '../../../api/types/outgoing/breakout';
import { ClockIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectCombinedParticipantsAndUserInConference } from '../../../store/selectors';
import { selectAllBreakoutRooms, selectExpiredDate } from '../../../store/slices/breakoutSlice';
import { selectLivekitRoom } from '../../../store/slices/livekitSlice';
import { selectOurUuid } from '../../../store/slices/userSlice';
import { BreakoutRoomId, RoomKind } from '../../../types';
import RoomOverviewListItem from './RoomOverviewListItem';

const StyledClockIcon = styled(ClockIcon)(({ theme }) => ({
  verticalAlign: 'middle',
  marginRight: theme.spacing(1),
  fill: theme.palette.secondary.main,
}));

const Button = styled(MuiButton)(({ theme }) => ({
  color: theme.palette.error.contrastText,
  backgroundColor: theme.palette.error.main,
  '&:hover': {
    opacity: 0.8,
    backgroundColor: theme.palette.error.main,
  },
}));

const ListContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'auto',
});

const RoomOverview = () => {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);
  const participants = useAppSelector(selectCombinedParticipantsAndUserInConference);
  const expires = useAppSelector(selectExpiredDate);
  const ourUuid = useAppSelector(selectOurUuid);
  const room = useAppSelector(selectLivekitRoom);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const breakoutRooms = useAppSelector(selectAllBreakoutRooms);
  const calculateTimeLeft = (expiredDate: Date) => {
    const distance = expiredDate.getTime() - Date.now();
    return {
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  };

  useEffect(() => {
    if (expires === undefined || expires === null) {
      const resetTimeout = setTimeout(() => setTimeLeft(null), 0);
      return () => clearTimeout(resetTimeout);
    }

    const expiredDate = new Date(expires);
    const updateTimeLeft = () => {
      const remainingTime = calculateTimeLeft(expiredDate);
      if (remainingTime.minutes > 0 || remainingTime.seconds > 0) {
        setTimeLeft(remainingTime);
        return false;
      }
      setTimeLeft({ minutes: 0, seconds: 0 });
      return true;
    };

    const timer = setInterval(() => {
      const reachedEnd = updateTimeLeft();
      if (reachedEnd) {
        clearInterval(timer);
      }
    }, 1000);

    const initialTimeout = setTimeout(() => {
      const reachedEnd = updateTimeLeft();
      if (reachedEnd) {
        clearInterval(timer);
      }
    }, 0);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimeout);
    };
  }, [expires]);

  const stopBreakoutRoom = () => {
    dispatch(stop.action({}));
  };

  const renderDurationText = () => {
    if (expires !== null && expires !== undefined) {
      if (timeLeft !== null && timeLeft.minutes > 0) {
        return `${timeLeft.minutes} min`;
      }
      if (timeLeft !== null && timeLeft.seconds !== undefined) {
        return `${timeLeft.seconds}s`;
      }
    }
    return t('breakout-room-room-overview-no-duration');
  };

  const switchToBreakoutRoom = (id: BreakoutRoomId) => {
    // ensures LiveKit creates a new connection; prevents "already connected to room ..." error
    room?.disconnect();
    dispatch(
      switchRoom.action({
        kind: RoomKind.Breakout,
        id,
      })
    );
  };

  const renderAccordions = () => {
    return breakoutRooms.map((breakout) => {
      const participantsInCurrentBreakout = participants
        .filter((participant) => participant.breakoutRoomId === breakout.id && !participant.leftAt)
        .sort((_a, b) => (b.id === ourUuid ? 1 : 0)); //// push the current user in his breakout room on top of the list

      return (
        <RoomOverviewListItem
          groupedParticipants={participantsInCurrentBreakout}
          breakoutRoomId={breakout.id}
          joinRoom={(breakoutRoom) => switchToBreakoutRoom(breakoutRoom)}
          key={breakout.id}
        />
      );
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        gap: 1,
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box>
        <Typography variant="body2" color="primary">
          <StyledClockIcon />
          {renderDurationText()}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="body2"
          noWrap
          sx={{
            paddingTop: 1,
          }}
        >
          {t('breakout-room-room-overview-participant-list')}
        </Typography>
        <ListContainer>{renderAccordions()}</ListContainer>
      </Box>
      <Box>
        <Button variant="contained" onClick={stopBreakoutRoom}>
          {t('breakout-room-room-overview-button-close')}
        </Button>
      </Box>
    </Box>
  );
};

export default RoomOverview;
