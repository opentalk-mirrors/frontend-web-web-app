// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, List as MuiList, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { acceptParticipantFromWaitingRoomToRoom } from '../../api/types/outgoing/moderation';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  approvedAll,
  selectAllParticipantsInWaitingRoom,
  selectNotApprovedParticipants,
} from '../../store/slices/participantsSlice';
import WaitingParticipantItem from './fragments/WaitingParticipantsItem';

const List = styled(MuiList)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'space-between',
  borderRadius: '0.1rem',
  overflow: 'hidden',
  gap: theme.spacing(1.25),
}));

const Subheader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'transparent',
  marginBottom: theme.spacing(2),
}));

const ScrollableBox = styled(Box)({
  overflow: 'auto',
  maxHeight: 'calc(calc(2.25rem + 20px) * 3.25)', // (2.25rem = avatar height) + (8px padding top + 6px name margin top + 6px name margin bottom)
});

interface WaitingParticipantsListProps {
  /**
   * Passed when used inside popover for accessibility
   */
  id?: string;
  className?: string;
}

const WaitingParticipantsList = ({ id }: WaitingParticipantsListProps) => {
  const { t } = useTranslation();
  const participantsInWaitingRoom = useAppSelector(selectAllParticipantsInWaitingRoom);
  const participantsNotApproved = useAppSelector(selectNotApprovedParticipants);
  const dispatch = useAppDispatch();

  const handleApproveAll = () => {
    if (participantsNotApproved.length > 0) {
      participantsNotApproved.forEach((participant) => {
        dispatch(acceptParticipantFromWaitingRoomToRoom.action({ target: participant.participantId }));
      });
      dispatch(approvedAll());
    }
  };

  return (
    <>
      <Subheader>
        <Typography variant="body2">{t('waiting-room-participant-list-label')}</Typography>
        <Button
          variant="text"
          disabled={participantsNotApproved.length === 0}
          onClick={handleApproveAll}
          focusRipple
          color="secondary"
        >
          {t('approve-all-participants-from-waiting')}
        </Button>
      </Subheader>
      <ScrollableBox>
        <List id={id}>
          {participantsInWaitingRoom.map((participant) => (
            <WaitingParticipantItem key={participant.id} participant={participant} />
          ))}
        </List>
      </ScrollableBox>
    </>
  );
};

export default WaitingParticipantsList;
