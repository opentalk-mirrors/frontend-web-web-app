// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { range, shuffle } from 'lodash';
import { useCallback, useMemo, useState } from 'react';

import { BreakoutRoomConfig } from '../../../../api/types/outgoing/breakout';
import { ParticipantId } from '../../../../types';
import { MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM, MINIMUM_NUMBER_OF_ROOMS } from '../constants';
import { Assignments } from '../types/assignments';
import { getAssignmentsWithParticipantAdded } from '../utils/getAssignmentsWithParticipantAdded';
import { getAssignmentsWithParticipantRemoved } from '../utils/getAssignmentsWithParticipantRemoved';
import { getRemovedAssignmentsAboveLimit } from '../utils/getRemovedAssignmentsAboveLimit';
import { isUnpopulatedRoom } from '../utils/isUnpopulatedRoom';

export function useRoomLimitStrategy(totalNumberOfParticipants: number = 1) {
  const [limit, setLimit] = useState<number>(MINIMUM_NUMBER_OF_ROOMS);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set());

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      setAssignments((existingAssignments) => {
        if (newLimit < limit) {
          return getRemovedAssignmentsAboveLimit(newLimit, existingAssignments);
        }
        return existingAssignments;
      });
      setLimit(newLimit);
      setExpandedRooms((expandedRooms) => {
        const newExpandedRooms = new Set(expandedRooms);
        range(0, limit).forEach((roomIndex) => {
          if (roomIndex >= newLimit) {
            newExpandedRooms.delete(roomIndex);
          }
        });
        return newExpandedRooms;
      });
    },
    [limit]
  );

  const necessaryNumberOfParticipants = limit * MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM;

  const hasInsufficientParticipants = totalNumberOfParticipants < necessaryNumberOfParticipants;

  const hasUnpopulatedRooms = useMemo(() => {
    return range(0, limit).some((roomIndex) => isUnpopulatedRoom(assignments, roomIndex));
  }, [limit, assignments]);

  const hasInsufficientParticipantsInRooms = useMemo(() => {
    return range(0, limit).some(
      (roomIndex) =>
        isUnpopulatedRoom(assignments, roomIndex) ||
        assignments[roomIndex].length < MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM
    );
  }, [limit, assignments]);

  const assignParticipantToRoom = useCallback((participantId: ParticipantId, roomIndex: number) => {
    setAssignments(getAssignmentsWithParticipantAdded(participantId, roomIndex));
  }, []);

  const removeParticipantFromRoom = useCallback((participantId: ParticipantId, roomIndex: number) => {
    setAssignments(getAssignmentsWithParticipantRemoved(participantId, roomIndex));
  }, []);

  const isAssignedToRoom = useCallback(
    (participantId: ParticipantId, roomIndex: number) => {
      return assignments[roomIndex] ? assignments[roomIndex].includes(participantId) : false;
    },
    [assignments]
  );

  const clearAssignments = useCallback(() => {
    setAssignments({});
  }, []);

  const clearRoomAssignments = useCallback((roomIndex: number) => {
    setAssignments((existingAssignments) => {
      const newAssignments = { ...existingAssignments };
      delete newAssignments[roomIndex];
      return newAssignments;
    });
  }, []);

  const isAssignedToAnyRoom = useCallback(
    (participantId: ParticipantId) => {
      return Object.values(assignments).some((assignedParticipants) => assignedParticipants.includes(participantId));
    },
    [assignments]
  );

  const toBreakoutRooms = useCallback((): Array<BreakoutRoomConfig> => {
    return range(0, limit).map((roomIndex) => ({
      name: `Room ${roomIndex + 1}`,
      assignments: (assignments[roomIndex] || []) as Array<ParticipantId>,
    }));
  }, [assignments, limit]);

  const toRandomBreakoutRoomPlaceholders = useCallback((): Array<{ name: string; assignments: Array<number> }> => {
    // 1. Shuffle participants.
    const shuffled_indexes = shuffle(range(0, totalNumberOfParticipants));

    // 2. Assign minimum number of participants to each room until we reach the limit or run out of participants.
    const placeholders: Array<{ name: string; assignments: Array<number> }> = [];
    let participantIndex = 0;
    for (let roomIndex = 0; roomIndex < limit; roomIndex++) {
      const roomAssignments: Array<number> = [];
      for (
        let i = 0;
        i < MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM && participantIndex < totalNumberOfParticipants;
        i++
      ) {
        roomAssignments.push(shuffled_indexes[participantIndex]);
        participantIndex++;
      }
      placeholders.push({ name: `Room ${roomIndex + 1}`, assignments: roomAssignments });
    }

    // 3. If there are still participants left, assign them to rooms in a round-robin manner.
    let roomIndex = 0;
    while (participantIndex < totalNumberOfParticipants) {
      placeholders[roomIndex].assignments.push(shuffled_indexes[participantIndex]);
      participantIndex++;
      roomIndex = (roomIndex + 1) % limit;
    }

    return placeholders;
  }, [totalNumberOfParticipants, limit]);

  return {
    limit,
    handleLimitChange,
    numberOfRooms: limit,
    hasUnpopulatedRooms,
    hasInsufficientParticipantsInRooms,
    assignParticipantToRoom,
    removeParticipantFromRoom,
    necessaryNumberOfParticipants,
    hasInsufficientParticipants,
    isAssignedToRoom,
    clearAssignments,
    clearRoomAssignments,
    isAssignedToAnyRoom,
    toBreakoutRooms,
    toRandomBreakoutRoomPlaceholders,
    expandedRooms,
    setExpandedRooms,
  };
}
