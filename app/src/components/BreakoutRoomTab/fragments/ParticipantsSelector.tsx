// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Typography, styled } from '@mui/material';
import i18n from 'i18next';
import { xorBy } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';

import { AccordionItem } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectCombinedParticipantsAndUser } from '../../../store/selectors';
import { Participant } from '../../../types';
import type { BreakoutRoomWithFullParticipants } from './CreateRoomsForm';
import ParticipantsEditor from './ParticipantsEditor';
import { DropdownOptions } from './constants';

const UserNameContainer = styled('div')(({ theme }) => ({
  '& > *': {
    color: theme.palette.common.white,
  },
  '& > *:not(:last-child)': {
    paddingBottom: theme.spacing(1),
  },
}));

interface IParticipantsSelectorProps {
  assignments: BreakoutRoomWithFullParticipants[];
  selectionMode: DropdownOptions;
  rooms: number;
  participantsPerRoom: number;
  onChange: (value: BreakoutRoomWithFullParticipants[]) => void;
}

const ParticipantsSelector = ({
  assignments,
  selectionMode,
  rooms,
  participantsPerRoom,
  onChange,
}: IParticipantsSelectorProps) => {
  const participants = useAppSelector(selectCombinedParticipantsAndUser);
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);

  const createDefaultRooms = useCallback(
    (roomCount: number) =>
      Array(roomCount)
        .fill(null)
        .map((_, index) => ({
          name: i18n.t('room', { roomNumber: index + 1 }),
          assignments: [],
        })),
    []
  );

  const calculatedAssignments = useMemo(() => {
    let assignedRooms: number;
    switch (selectionMode) {
      case DropdownOptions.Rooms:
        assignedRooms = Math.max(2, rooms);
        break;
      case DropdownOptions.Participants: {
        const safeParticipantsPerRoom = Math.max(2, participantsPerRoom);
        assignedRooms = Math.floor(participants.length / safeParticipantsPerRoom);
        break;
      }
    }
    const baseAssignments: BreakoutRoomWithFullParticipants[] = createDefaultRooms(assignedRooms);

    return baseAssignments.map((breakoutRoom) => ({
      ...breakoutRoom,
      assignments: assignments.find((assignment) => assignment.name === breakoutRoom.name)?.assignments ?? [],
    }));
  }, [assignments, createDefaultRooms, participants, participantsPerRoom, rooms, selectionMode]);

  const unassignedParticipants = useMemo(() => {
    const assignedParticipantsList: Participant[] = calculatedAssignments.flatMap(
      (breakoutRoom) => breakoutRoom.assignments
    );
    return xorBy(assignedParticipantsList, participants, 'id');
  }, [calculatedAssignments, participants]);

  const handleChange = useCallback(
    (breakoutRoomName: string, assignedParticipants: Participant[]) => {
      const newAssignments = calculatedAssignments.map((prevAssignedParticipant) => {
        if (breakoutRoomName === prevAssignedParticipant.name) {
          return {
            ...prevAssignedParticipant,
            assignments: assignedParticipants,
          };
        }
        return prevAssignedParticipant;
      });
      onChange(newAssignments);
    },
    [calculatedAssignments, onChange]
  );

  const RenderedRooms = useMemo(() => {
    const handleExpandedChange = (event: React.SyntheticEvent<Element, Event>, newExpanded: boolean, panel: string) => {
      if (
        !(
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLSpanElement ||
          event.target instanceof HTMLLabelElement
        )
      ) {
        setExpandedPanels((prevExpanded) => {
          if (newExpanded) {
            return prevExpanded.includes(panel) ? prevExpanded : [...prevExpanded, panel];
          }

          return prevExpanded.filter((p) => p !== panel);
        });
      }
    };

    const handleParticipantsEditorChange = (roomName: string, participants: Participant[]) => {
      handleChange(roomName, participants);
      setExpandedPanels((prevExpanded) => {
        if (participants.length > 0) {
          return prevExpanded.includes(roomName) ? prevExpanded : [...prevExpanded, roomName];
        }
        return prevExpanded.filter((p) => p !== roomName);
      });
    };

    return calculatedAssignments.map(({ name, assignments }) => (
      <Box position="relative" key={name}>
        <AccordionItem
          onChange={(event, newExpanded) => handleExpandedChange(event, newExpanded, name)}
          expanded={expandedPanels.includes(name)}
          summaryText={`${name} (${assignments.length})`}
          headingComponent="h4"
        >
          <UserNameContainer>
            {assignments.map((assignment) => (
              <Typography key={assignment.id} variant="body1" translate="no">
                {assignment.displayName}
              </Typography>
            ))}
          </UserNameContainer>
        </AccordionItem>
        <ParticipantsEditor
          title={name}
          onChange={(participants) => handleParticipantsEditorChange(name, participants)}
          unAssignedParticipants={unassignedParticipants}
          assignedParticipants={assignments}
        />
      </Box>
    ));
  }, [calculatedAssignments, expandedPanels, handleChange, unassignedParticipants]);

  return (
    <Box
      data-testid="participant-selector"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
      }}
    >
      <Box
        sx={{
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            overflow: 'auto',
            height: '100%',
          }}
        >
          {RenderedRooms}
        </Box>
      </Box>
    </Box>
  );
};

export default ParticipantsSelector;
