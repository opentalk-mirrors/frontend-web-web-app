// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button as MuiButton, List, styled, Typography, Stack } from '@mui/material';
import { useCallback, useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { AccordionItem, ParticipantAvatar } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectBreakoutRoomById, selectCurrentBreakoutRoomId } from '../../../store/slices/breakoutSlice';
import { selectOurUuid } from '../../../store/slices/userSlice';
import { BreakoutRoomId, ParticipationKind, Participant } from '../../../types';

const Avatar = styled(ParticipantAvatar)({
  width: '2.25rem',
  height: '2.25rem',
  fontSize: '0.75rem',
});

interface RoomOverviewListProps {
  joinRoom: (breakoutRoomId: BreakoutRoomId) => void;
  groupedParticipants: Participant[];
  breakoutRoomId: BreakoutRoomId;
}

const RoomOverviewListItem = ({ joinRoom, groupedParticipants, breakoutRoomId }: RoomOverviewListProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const currentBreakoutRoomId = useAppSelector(selectCurrentBreakoutRoomId);
  const breakoutRoom = useAppSelector(selectBreakoutRoomById(breakoutRoomId));
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

  const handleJoinRoom = (e: MouseEvent) => {
    e.stopPropagation();
    joinRoom(breakoutRoomId);
  };

  const handleAccordionChange = () => {
    setExpanded((prevState) => !prevState);
  };

  return (
    <AccordionItem
      onChange={handleAccordionChange}
      expanded={expanded}
      defaultExpanded={true}
      summaryText={breakoutRoom?.name ?? ''}
      headingComponent="h5"
      summaryEndAdornment={
        currentBreakoutRoomId !== breakoutRoomId && (
          <MuiButton variant="text" size="small" onClick={handleJoinRoom} color="secondary">
            {t('moderator-join-breakout-room')}
          </MuiButton>
        )
      }
    >
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
                isSipParticipant={participant.participationKind === ParticipationKind.CallIn}
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
    </AccordionItem>
  );
};

export default RoomOverviewListItem;
