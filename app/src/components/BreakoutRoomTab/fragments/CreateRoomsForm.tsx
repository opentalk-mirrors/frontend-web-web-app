// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Divider, Popover, SelectChangeEvent, Stack } from '@mui/material';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { start } from '../../../api/types/outgoing/breakout';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectBreakoutRoomSelectorParticipants } from '../../../store/selectors';
import { ParticipantId } from '../../../types';
import { Minutes, Seconds } from '../../../utils/tsUtils';
import { DurationRow } from './DurationRow';
import { LimitPicker } from './LimitPicker';
import { MinimumWarning } from './MinimumWarning';
import { ParticipantsPopoverContent } from './ParticipantsPopoverContent';
import { RandomDistributionRow } from './RandomDistributionRow';
import { RoomPreview } from './RoomPreview';
import { SelectionModeRow } from './SelectionModeRow';
import {
  DropdownOptions,
  MAXIMUM_NUMBER_OF_ROOMS,
  MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM,
  MINIMUM_NUMBER_OF_ROOMS,
} from './constants';
import { useFormState } from './hooks/useFormState';
import { sortByDisplayName } from './utils/sortByDisplayName';

const CreateRoomsForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const participants = useAppSelector(selectBreakoutRoomSelectorParticipants);
  const sortedParticipants = useMemo(() => sortByDisplayName(participants), [participants]);
  const [containerReference, setContainerReference] = useState<HTMLElement | null>(null);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number>(-1);
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const {
    dropdownOption,
    setDropdownOption,
    limit,
    changeLimit,
    randomDistribution,
    setRandomDistribution,
    numberOfCreatedRooms,
    isAssignedToRoom,
    necessaryNumberOfParticipants,
    hasInsufficientParticipants,
    hasInsufficientParticipantsInRooms,
    clearRoomAssignments,
    assignParticipantToRoom,
    isAssignedToAnyRoom,
    toBreakoutRooms,
    toRandomBreakoutRoomPlaceholders,
    expandedRooms,
    setExpandedRooms,
  } = useFormState(sortedParticipants.length);

  const [duration, setDuration] = useState<Minutes | null>(null);

  const participantsInRooms = useMemo(() => {
    return Array.from({ length: numberOfCreatedRooms }, (_, roomIndex) =>
      sortedParticipants
        .filter((participant) => isAssignedToRoom(participant.id, roomIndex))
        .map((p) => ({ id: p.id, displayName: p.displayName }))
    );
  }, [numberOfCreatedRooms, sortedParticipants, isAssignedToRoom]);

  const handleChangeDurationValue = useCallback((value: number | null) => {
    setDuration(value as Minutes);
  }, []);

  const handleDurationChangeEvent = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(event.target.value) as Minutes);
  }, []);

  const isStartButtonDisabled =
    hasInsufficientParticipants || (!randomDistribution && hasInsufficientParticipantsInRooms);

  const collapseRoom = useCallback(
    (roomIndex: number) => {
      setExpandedRooms((prev) => {
        const newSet = new Set(prev);
        newSet.delete(roomIndex);
        return newSet;
      });
    },
    [setExpandedRooms]
  );

  const expandRoom = useCallback(
    (roomIndex: number) => {
      setExpandedRooms((prev) => new Set(prev).add(roomIndex));
    },
    [setExpandedRooms]
  );

  const handleDropdownOptionChangeEvent = useCallback(
    (event: SelectChangeEvent) => {
      setDropdownOption(event.target.value as DropdownOptions);
    },
    [setDropdownOption]
  );

  const handleChangeLimitEvent = useCallback(
    (value: number) => {
      const minLimit =
        dropdownOption === DropdownOptions.Rooms ? MINIMUM_NUMBER_OF_ROOMS : MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM;
      changeLimit(Math.max(minLimit, value));
    },
    [changeLimit, dropdownOption]
  );

  const handleRandomDistributionChangeEvent = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setRandomDistribution(event.target.checked);
    },
    [setRandomDistribution]
  );

  const handlePopoverCloseEvent = useCallback(() => {
    setOpenPopover(false);
  }, []);

  const openEditingPopover = useCallback((roomIndex: number) => {
    setEditingRoomIndex(roomIndex);
    setOpenPopover(true);
  }, []);

  const handlePopoverSave = useCallback(
    (participants: ReadonlyArray<ParticipantId>) => {
      if (editingRoomIndex !== -1) {
        clearRoomAssignments(editingRoomIndex);
        participants.forEach((participantId) => {
          assignParticipantToRoom(participantId, editingRoomIndex);
        });
        if (participants.length > 0) {
          expandRoom(editingRoomIndex);
        } else {
          collapseRoom(editingRoomIndex);
        }
      }
      setOpenPopover(false);
    },
    [clearRoomAssignments, assignParticipantToRoom, editingRoomIndex, collapseRoom, expandRoom]
  );

  const handleRoomExpandChange = useCallback(
    (roomIndex: number) => {
      setExpandedRooms((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(roomIndex)) {
          newSet.delete(roomIndex);
        } else {
          newSet.add(roomIndex);
        }
        return newSet;
      });
    },
    [setExpandedRooms]
  );

  const handleBreakoutRoomStart = useCallback(() => {
    if (randomDistribution) {
      dispatch(
        start.action({
          duration: duration ? ((duration * 60) as Seconds) : undefined,
          rooms: toRandomBreakoutRoomPlaceholders().map((placeholder) => ({
            name: placeholder.name,
            assignments: placeholder.assignments.map((assignment) => sortedParticipants[assignment].id),
          })),
        })
      );
    } else {
      dispatch(
        start.action({
          duration: duration ? ((duration * 60) as Seconds) : undefined,
          rooms: toBreakoutRooms(),
        })
      );
    }
  }, [randomDistribution, dispatch, toBreakoutRooms, toRandomBreakoutRoomPlaceholders, sortedParticipants, duration]);

  const popoverParticipants = useMemo(() => {
    return sortedParticipants.filter(
      (participant) => !isAssignedToAnyRoom(participant.id) || isAssignedToRoom(participant.id, editingRoomIndex)
    );
  }, [sortedParticipants, isAssignedToAnyRoom, isAssignedToRoom, editingRoomIndex]);

  const popoverAssignedParticipants = useMemo(() => {
    if (editingRoomIndex === -1) {
      return [];
    }
    return sortedParticipants
      .filter((participant) => isAssignedToRoom(participant.id, editingRoomIndex))
      .map((p) => p.id);
  }, [sortedParticipants, isAssignedToRoom, editingRoomIndex]);

  return (
    <Box display="flex" flexDirection="column" gap={2} overflow="auto">
      <DurationRow
        value={duration}
        changeValue={handleChangeDurationValue}
        handleChangeEvent={handleDurationChangeEvent}
      />
      <SelectionModeRow value={dropdownOption} onChange={handleDropdownOptionChangeEvent} />
      {dropdownOption === DropdownOptions.Rooms && (
        <LimitPicker
          min={MINIMUM_NUMBER_OF_ROOMS}
          max={MAXIMUM_NUMBER_OF_ROOMS}
          value={limit}
          onChange={handleChangeLimitEvent}
          name="rooms"
          labelKey="breakout-room-form-field-rooms"
        />
      )}
      {dropdownOption === DropdownOptions.Participants && (
        <LimitPicker
          min={MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM}
          max={Math.max(MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM, sortedParticipants.length)}
          value={limit}
          onChange={handleChangeLimitEvent}
          name="participantsPerRoom"
          labelKey="breakout-room-form-field-participants-per-room"
        />
      )}
      <RandomDistributionRow value={randomDistribution} onChange={handleRandomDistributionChangeEvent} />
      <Box ref={setContainerReference}>
        <Divider />
        {!randomDistribution && (
          <Stack spacing={1.25}>
            {participantsInRooms.map((participants, index) => (
              <RoomPreview
                key={index}
                index={index}
                name={`Room ${index + 1}`}
                expanded={expandedRooms.has(index)}
                onRoomExpandChange={handleRoomExpandChange}
                onEditButtonClick={openEditingPopover}
                participants={participants}
              />
            ))}
            <Popover
              open={openPopover}
              onClose={handlePopoverCloseEvent}
              anchorEl={containerReference}
              anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
              transformOrigin={{ vertical: 'center', horizontal: 'left' }}
              keepMounted={false}
              closeAfterTransition
            >
              <ParticipantsPopoverContent
                editingRoomIndex={editingRoomIndex}
                onCancel={handlePopoverCloseEvent}
                onSave={handlePopoverSave}
                participants={popoverParticipants}
                assignedParticipants={popoverAssignedParticipants}
              />
            </Popover>
          </Stack>
        )}
        <Stack mt={2} spacing={2}>
          {hasInsufficientParticipants && (
            <MinimumWarning
              labelKey="breakout-room-insufficient-number-of-participants-warning"
              minimumNumberOfParticipants={necessaryNumberOfParticipants}
            />
          )}
          {hasInsufficientParticipantsInRooms && !randomDistribution && (
            <MinimumWarning
              labelKey="breakout-room-underpopulated-rooms-warning"
              minimumNumberOfParticipants={
                dropdownOption === DropdownOptions.Rooms ? MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM : limit
              }
            />
          )}

          <Button onClick={handleBreakoutRoomStart} disabled={isStartButtonDisabled} color="secondary">
            {t('breakout-room-start-button')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default CreateRoomsForm;
