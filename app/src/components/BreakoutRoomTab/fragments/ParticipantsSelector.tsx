// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Typography, styled } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import i18n from 'i18next';
import { get, includes, isEmpty, reduce, xorBy } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AccordionItem, ErrorFormMessage } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectCombinedParticipantsAndUser } from '../../../store/selectors';
import { Participant } from '../../../types';
import ParticipantsEditor from './ParticipantsEditor';
import { AccordionOptions } from './constants';

const UserNameContainer = styled('div')(({ theme }) => ({
  '& > *': {
    color: theme.palette.common.white,
  },
  '& > *:not(:last-child)': {
    paddingBottom: theme.spacing(1),
  },
}));

export interface BreakoutRoomWithFullParticipants {
  name: string;
  assignments: Participant[];
}

interface IParticipantsSelectorProps {
  name: string;
  formName?: string;
  onSubmit: () => void;
}

const ParticipantsSelector = ({ name, formName, onSubmit }: IParticipantsSelectorProps) => {
  const getFormName = useCallback((name: string) => (formName ? `${formName}.${name}` : name), [formName]);
  const [field, meta, helpers] = useField(name);
  const { values } = useFormikContext();
  const [error, setError] = useState<string | null>(null);
  const participants = useAppSelector(selectCombinedParticipantsAndUser);
  const [unassignedParticipants, setUnassignedParticipants] = useState<Participant[]>(participants);
  const [assignedParticipants, setAssignedParticipants] = useState<Array<BreakoutRoomWithFullParticipants>>(
    field.value || []
  );
  const [expanded, setExpanded] = useState<false | string>(false);
  const expandedRef = useRef<AccordionOptions>(get(values, 'expanded', AccordionOptions.Rooms));
  const roomsRef = useRef<number>(get(values, getFormName('rooms'), 1));
  const participantsTotal = useRef<number>(participants.length);
  const { t } = useTranslation();

  const handleSetUnAssignedParticipants = useCallback(
    (breakoutRooms: Array<BreakoutRoomWithFullParticipants>, allParticipants: Participant[]) => {
      const assignedParticipants: Participant[] = breakoutRooms.flatMap((breakoutRoom) => breakoutRoom.assignments);
      setUnassignedParticipants(xorBy(assignedParticipants, allParticipants, 'id'));
    },
    []
  );

  useEffect(() => {
    setAssignedParticipants((prevAssignedParticipants) => {
      prevAssignedParticipants = prevAssignedParticipants.map((prevAssignedParticipant) => ({
        ...prevAssignedParticipant,
        assignments: prevAssignedParticipant.assignments.filter((assignment) => includes(participants, assignment)),
      }));
      handleSetUnAssignedParticipants(prevAssignedParticipants, participants);
      return prevAssignedParticipants;
    });
  }, [participants, handleSetUnAssignedParticipants]);

  const initRooms = useCallback((roomCount: number) => {
    const breakoutRooms: Array<{ name: string; assignments: Participant[] }> = Array(roomCount)
      .fill(null)
      .map((roomId, index) => ({
        name: i18n.t('room', { roomNumber: index + 1 }),
        assignments: [],
      }));
    setAssignedParticipants(breakoutRooms);
  }, []);

  useEffect(() => {
    if (isEmpty(field.value)) {
      let rooms: number;
      switch (expandedRef.current) {
        case AccordionOptions.Rooms:
          rooms = roomsRef.current;
          break;
        case AccordionOptions.Participants: {
          const participantsPerRoom = get(values, getFormName('participantsPerRoom'), 1);
          rooms = Math.floor(participantsTotal.current / participantsPerRoom);
          break;
        }
        case AccordionOptions.Moderators:
        case AccordionOptions.Groups:
          // todo get all moderator count and add init with moderators as dividers here
          rooms = 4;
          break;
      }
      initRooms(rooms);
    }
  }, [field.value, getFormName, initRooms, values]);

  const allParticipantsAssigned = () => {
    const assignments: BreakoutRoomWithFullParticipants[] = field.value;
    const assignedParticipantsCount = reduce(assignments, (acc, { assignments }) => acc + assignments.length, 0);
    return assignedParticipantsCount === participants.length;
  };

  const validateRoomsByRooms = () => {
    const assignments: BreakoutRoomWithFullParticipants[] = field.value;

    const rooms = get(values, getFormName('rooms'), 1);
    const maxParticipantsPerRoom = Math.floor(participants.length / rooms + 0.5);

    const valid =
      assignments.every(({ assignments }) => assignments.length > 0 && assignments.length <= maxParticipantsPerRoom) &&
      allParticipantsAssigned();
    return {
      valid,
      error: valid ? null : i18n.t('user-selection-error-invalid-room-assignments'),
    };
  };

  const validateRoomsByParticipants = () => {
    const assignments: BreakoutRoomWithFullParticipants[] = field.value;

    const participantsPerRoom = get(values, getFormName('participantsPerRoom'), 1);
    const valid =
      assignments.every(({ assignments }) => assignments.length > 0 && assignments.length <= participantsPerRoom) &&
      allParticipantsAssigned();
    return {
      valid,
      error: valid ? null : i18n.t('user-selection-error-invalid-room-assignments'),
    };
  };

  const validateBreakoutRoomAssignment = (): { valid: boolean; error: string | null } => {
    const expandedForm: AccordionOptions = get(values, 'expanded', AccordionOptions.Rooms);

    if (expandedForm === AccordionOptions.Rooms) {
      return validateRoomsByRooms();
    }
    if (expandedForm === AccordionOptions.Participants) {
      return validateRoomsByParticipants();
    }
    return {
      valid: true,
      error: null,
    };
  };

  const customSubmit = () => {
    const { valid, error } = validateBreakoutRoomAssignment();
    if (valid) {
      onSubmit();
    } else {
      setError(error);
    }
  };

  const handleExpandedChange = (event: React.SyntheticEvent<Element, Event>, newExpanded: boolean, panel: string) => {
    if (
      !(
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSpanElement ||
        event.target instanceof HTMLLabelElement
      )
    ) {
      const expanded = newExpanded ? panel : false;
      setExpanded(expanded);
    }
  };

  const handleChange = useCallback(
    (breakoutRoomName: string, assignedParticipants: Participant[]) => {
      setAssignedParticipants((prevAssignedParticipants) => {
        prevAssignedParticipants = prevAssignedParticipants.map((prevAssignedParticipant) => {
          if (breakoutRoomName === prevAssignedParticipant.name) {
            return {
              ...prevAssignedParticipant,
              assignments: assignedParticipants,
            };
          }
          return prevAssignedParticipant;
        });
        helpers.setValue(prevAssignedParticipants);
        handleSetUnAssignedParticipants(prevAssignedParticipants, participants);
        return prevAssignedParticipants;
      });
    },
    [helpers, participants, handleSetUnAssignedParticipants]
  );

  const renderRooms = () => {
    return assignedParticipants.map(({ name, assignments }) => (
      <AccordionItem
        key={name}
        onChange={(event, newExpanded) => handleExpandedChange(event, newExpanded, name)}
        option={AccordionOptions.Rooms}
        expanded={expanded === name}
        summaryText={`${name} (${assignments.length})`}
        editComponent={
          <ParticipantsEditor
            title={name}
            onChange={(participants) => {
              handleChange(name, participants);
            }}
            unAssignedParticipants={unassignedParticipants}
            assignedParticipants={assignments}
          />
        }
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
  };

  return (
    <Box display="flex" flexDirection="column" gap={1} height="100%" data-testid="participant-selector">
      <Box flex={1} height="100%" overflow="hidden">
        <Box overflow="auto" height="100%">
          {renderRooms()}
        </Box>
      </Box>
      {meta.error ||
        (error && (
          <Box>
            <ErrorFormMessage helperText={meta.error || error} />
          </Box>
        ))}
      <Box>
        <Button onClick={customSubmit}>{t('breakout-room-create-button')}</Button>
      </Box>
    </Box>
  );
};

export default ParticipantsSelector;
