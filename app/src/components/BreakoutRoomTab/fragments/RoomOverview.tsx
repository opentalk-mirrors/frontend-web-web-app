// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button as MuiButton, styled, Box, Typography } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { stop } from '../../../api/types/outgoing/breakout';
import { ClockIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useInviteCode } from '../../../hooks/useInviteCode';
import { startRoom } from '../../../store/commonActions';
import { selectCombinedParticipantsAndUserInCoference } from '../../../store/selectors';
import { selectAllBreakoutRooms, selectExpiredDate } from '../../../store/slices/breakoutSlice';
import { selectRoomPassword } from '../../../store/slices/roomSlice';
import { selectDisplayName, selectOurUuid } from '../../../store/slices/userSlice';
import { BreakoutRoomId } from '../../../types';
import { composeRoomPath } from '../../../utils/apiUtils';
import RoomOverviewListItem from './RoomOverviewListItem';

const StyledClockIcon = styled(ClockIcon)(({ theme }) => ({
  verticalAlign: 'middle',
  marginRight: theme.spacing(1),
  fill: theme.palette.primary.main,
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
  const participants = useAppSelector(selectCombinedParticipantsAndUserInCoference);
  const expires = useAppSelector(selectExpiredDate);
  const { roomId } = useParams<'roomId'>() as {
    roomId: RoomId;
  };
  const roomPassword = useAppSelector(selectRoomPassword);
  const displayName = useAppSelector(selectDisplayName);
  const ourUuid = useAppSelector(selectOurUuid);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const breakoutRooms = useAppSelector(selectAllBreakoutRooms);
  const calculateTimeLeft = (expiredDate: Date) => {
    const distance = expiredDate.getTime() - new Date().getTime();
    return {
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  };
  const inviteCode = useInviteCode();

  useEffect(() => {
    if (expires !== undefined && expires !== null) {
      const expiredDate = new Date(expires);
      setTimeLeft(calculateTimeLeft(expiredDate));
      const timer = setInterval(() => {
        const remainingTime = calculateTimeLeft(expiredDate);
        if (remainingTime.minutes > 0) {
          setTimeLeft(remainingTime);
        } else if (remainingTime.seconds > 0) {
          setTimeLeft(remainingTime);
        } else {
          setTimeLeft({ minutes: 0, seconds: 0 });
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [expires]);

  const stopBreakoutRoom = () => {
    dispatch(stop.action());
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

  const navigateToBreakoutRoom = (breakoutRoom: BreakoutRoomId) => {
    dispatch(
      startRoom({
        roomId: roomId,
        password: roomPassword,
        breakoutRoomId: breakoutRoom,
        displayName,
        inviteCode: inviteCode,
      })
    ).then(() => navigate(composeRoomPath(roomId, inviteCode, breakoutRoom)));
  };

  const renderAccordions = () => {
    return breakoutRooms.map((breakout) => {
      const participantsInCurrentBreakout = participants
        .filter((participant) => participant.breakoutRoomId === breakout.id && !participant.leftAt)
        .sort((a, b) => (b.id === ourUuid ? 1 : 0)); //// push the current user in his breakout room on top of the list

      return (
        <RoomOverviewListItem
          groupedParticipants={participantsInCurrentBreakout}
          breakoutRoomId={breakout.id}
          joinRoom={(breakoutRoom) => navigateToBreakoutRoom(breakoutRoom)}
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
        <Typography variant="h6">{t('breakout-room-room-overview-title')}</Typography>
      </Box>
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
        <Button color="primary" variant="contained" onClick={stopBreakoutRoom}>
          {t('breakout-room-room-overview-button-close')}
        </Button>
      </Box>
    </Box>
  );
};

export default RoomOverview;
