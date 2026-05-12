// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Button as MuiButton,
  ListItem as MuiListItem,
  ListItemAvatar as MuiListItemAvatar,
  ListItemText as MuiListItemText,
  Typography,
  styled,
} from '@mui/material';
import { truncate } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { acceptParticipantFromWaitingRoomToRoom } from '../../../api/types/outgoing/moderation';
import { ParticipantAvatar, notifications } from '../../../commonComponents';
import { useAppDispatch, useDateFormat } from '../../../hooks';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { approveToEnter } from '../../../store/slices/participantsSlice';
import { Participant, WaitingState } from '../../../types';

const ListItemAvatar = styled(MuiListItemAvatar)({
  '& .MuiAvatar-root': {
    width: '2.25rem',
    height: '2.25rem',
    fontSize: '0.75rem',
  },
});
const ListItem = styled(MuiListItem)(({ theme }) => ({
  padding: theme.spacing(0), // Inlined `p={0}` is not overriding the default padding.
}));

const ListItemText = styled(MuiListItemText)(({ theme }) => ({
  marginRight: theme.spacing(1),
  '& p': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap',
    fontWeight: 400,
    lineHeight: 1,
  },
}));

const JoinedText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  textWrap: 'nowrap',
}));

const Button = styled(MuiButton)({
  textWrap: 'nowrap',
});

type ParticipantRowProps = {
  participant: Participant;
};

const WaitingParticipantItem = ({ participant }: ParticipantRowProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const joinedTimestamp = participant.joinedAt ? new Date(participant.joinedAt) : new Date();
  const formattedTime = useDateFormat(joinedTimestamp, 'time');
  const isMobile = useIsMobile();

  const handleAccept = useCallback(() => {
    if (participant.waitingState === WaitingState.Waiting) {
      dispatch(acceptParticipantFromWaitingRoomToRoom.action({ target: participant.id }));
      dispatch(approveToEnter(participant.id));
      const displayName = truncate(participant.displayName, { length: 100 });
      notifications.info(t('meeting-notification-user-was-accepted', { user: displayName }));
    }
  }, [dispatch, participant, t]);

  const ParticipantWaitingState = useMemo(() => {
    switch (participant.waitingState) {
      case WaitingState.Waiting:
        return (
          <Button variant="text" onClick={handleAccept} focusRipple color="secondary">
            {t(`participant-menu-accept-participant${isMobile ? '-mobile' : ''}`)}
          </Button>
        );
      case WaitingState.Approved:
        return (
          <Button variant="text" disabled color="secondary">
            {t(`participant-menu-accepted-participant${isMobile ? '-mobile' : ''}`)}
          </Button>
        );
      default:
        return null;
    }
  }, [participant.waitingState, handleAccept, t, isMobile]);

  return (
    <ListItem>
      <ListItemAvatar>
        <ParticipantAvatar src={participant.avatarUrl} alt={participant.displayName}>
          {participant.displayName}
        </ParticipantAvatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="body1" translate="no">
            {participant.displayName}
          </Typography>
        }
        secondary={
          <JoinedText variant="caption">{t('participant-joined-text', { joinedTime: formattedTime })}</JoinedText>
        }
      />
      {ParticipantWaitingState}
    </ListItem>
  );
};

export default WaitingParticipantItem;
