// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Accordion as MuiAccordion,
  AccordionDetails,
  Button as MuiButton,
  List,
  styled,
  Typography,
  AccordionSummary as MuiAccordionSummary,
  Stack,
} from '@mui/material';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ArrowDownIcon } from '../../../assets/icons';
import { ParticipantAvatar } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectBreakoutRoomById, selectCurrentBreakoutRoomId } from '../../../store/slices/breakoutSlice';
import { selectOurUuid } from '../../../store/slices/userSlice';
import { BreakoutRoomId, ParticipationKind, Participant } from '../../../types';

const Avatar = styled(ParticipantAvatar)({
  width: '2.25rem',
  height: '2.25rem',
  fontSize: '0.75rem',
});

const Accordion = styled(MuiAccordion)({
  margin: '0 !important',
  backgroundColor: 'transparent',
});

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  margin: 0,
  padding: 0,
  flexDirection: 'row-reverse',
  gap: theme.spacing(1),
  '& .MuiAccordionSummary-content': {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  '& svg': {
    width: '0.75rem',
    color: 'white',
  },
}));

interface RoomOverviewListProps {
  joinRoom: (breakoutRoomId: BreakoutRoomId) => void;
  groupedParticipants: Participant[];
  breakoutRoomId: BreakoutRoomId;
}

const RoomOverviewListItem = ({ joinRoom, groupedParticipants, breakoutRoomId }: RoomOverviewListProps) => {
  const currentBreakoutRoomId = useAppSelector(selectCurrentBreakoutRoomId);
  const breakoutRoom = useAppSelector(selectBreakoutRoomById(breakoutRoomId));
  const { t } = useTranslation();
  const ourUuid = useAppSelector(selectOurUuid);

  const getParticipantLabel = useCallback(
    (participant: Participant) => {
      if (participant?.id === ourUuid) {
        return `${participant?.displayName} ${t('breakout-room-room-overview-participant-list-me')}`;
      }
      return participant?.displayName;
    },
    [ourUuid, t]
  );

  const handleJoinRoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    joinRoom(breakoutRoomId);
  };
  return (
    <Accordion defaultExpanded={true} elevation={0}>
      <AccordionSummary id={breakoutRoomId} expandIcon={<ArrowDownIcon />}>
        <Typography variant="caption">{breakoutRoom?.name}</Typography>
        {currentBreakoutRoomId !== breakoutRoomId && (
          <MuiButton variant="text" size="small" onClick={handleJoinRoom}>
            {t('moderator-join-breakout-room')}
          </MuiButton>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {groupedParticipants.map((participant) => {
            return (
              <Stack
                spacing={1}
                direction="row"
                key={participant.id}
                sx={{
                  alignItems: 'center',
                  py: 1,
                }}
              >
                <Avatar
                  src={participant?.avatarUrl}
                  alt={participant?.displayName}
                  isSipParticipant={participant.participationKind === ParticipationKind.Sip}
                >
                  {participant?.displayName}
                </Avatar>
                <Typography variant="body1" noWrap translate="no">
                  {getParticipantLabel(participant)}
                </Typography>
              </Stack>
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default RoomOverviewListItem;
