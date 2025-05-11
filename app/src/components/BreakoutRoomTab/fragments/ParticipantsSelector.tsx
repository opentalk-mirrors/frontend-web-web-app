// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Typography, styled } from '@mui/material';
import i18n from 'i18next';
import { includes, isEmpty, xorBy } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

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
  const [unassignedParticipants, setUnassignedParticipants] = useState<Participant[]>(participants);
  const [assignedParticipants, setAssignedParticipants] = useState<Array<BreakoutRoomWithFullParticipants>>(
    assignments || []
  );
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);

  const handleSetUnAssignedParticipants = useCallback(
    (breakoutRooms: Array<BreakoutRoomWithFullParticipants>, allParticipants: Participant[]) => {
      const assignedParticipants: Participant[] = breakoutRooms.flatMap((breakoutRoom) => breakoutRoom.assignments);
      setUnassignedParticipants(xorBy(assignedParticipants, allParticipants, 'id'));
    },
    []
  );

  useEffect(() => {
    setAssignedParticipants((prevAssignedParticipants) => {
      const newAssignments = prevAssignedParticipants.map((prevAssignedParticipant) => ({
        ...prevAssignedParticipant,
        assignments: prevAssignedParticipant.assignments.filter((assignment) => includes(participants, assignment)),
      }));
      handleSetUnAssignedParticipants(newAssignments, participants);
      return newAssignments;
    });
  }, [participants, handleSetUnAssignedParticipants]);

  const initRooms = useCallback((roomCount: number) => {
    const breakoutRooms: Array<{ name: string; assignments: Participant[] }> = Array(roomCount)
      .fill(null)
      .map((_, index) => ({
        name: i18n.t('room', { roomNumber: index + 1 }),
        assignments: [],
      }));
    setAssignedParticipants(breakoutRooms);
  }, []);

  useEffect(() => {
    if (isEmpty(assignments)) {
      let assigned_rooms: number;
      switch (selectionMode) {
        case DropdownOptions.Rooms:
          assigned_rooms = Math.max(2, rooms);
          break;
        case DropdownOptions.Participants: {
          const safeParticipantsPerRoom = Math.max(2, participantsPerRoom);
          assigned_rooms = Math.floor(participants.length / safeParticipantsPerRoom);
          break;
        }
      }

      initRooms(assigned_rooms);
    }
  }, [assignments, initRooms, selectionMode, participantsPerRoom, rooms, participants.length]);

  const handleChange = useCallback(
    (breakoutRoomName: string, assignedParticipants: Participant[]) => {
      setAssignedParticipants((prevAssignedParticipants) => {
        const newAssignments = prevAssignedParticipants.map((prevAssignedParticipant) => {
          if (breakoutRoomName === prevAssignedParticipant.name) {
            return {
              ...prevAssignedParticipant,
              assignments: assignedParticipants,
            };
          }
          return prevAssignedParticipant;
        });
        onChange(newAssignments);
        handleSetUnAssignedParticipants(newAssignments, participants);
        return newAssignments;
      });
    },
    [onChange, participants, handleSetUnAssignedParticipants]
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

    return assignedParticipants.map(({ name, assignments }) => (
      <AccordionItem
        key={name}
        onChange={(event, newExpanded) => handleExpandedChange(event, newExpanded, name)}
        expanded={expandedPanels.includes(name)}
        summaryText={`${name} (${assignments.length})`}
        summaryEndAdornment={
          <ParticipantsEditor
            title={name}
            onChange={(participants) => handleParticipantsEditorChange(name, participants)}
            unAssignedParticipants={unassignedParticipants}
            assignedParticipants={assignments}
          />
        }
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
    ));
  }, [assignedParticipants, expandedPanels, handleChange, unassignedParticipants]);

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
