// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { range, shuffle } from 'lodash';
import { useCallback, useMemo, useState } from 'react';

import { BreakoutRoomConfig } from '../../../../api/types/outgoing/breakout';
import { ParticipantId } from '../../../../types';
import { MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM } from '../constants';
import { Assignments } from '../types/assignments';
import { getAssignmentsWithParticipantAdded } from '../utils/getAssignmentsWithParticipantAdded';
import { getAssignmentsWithParticipantRemoved } from '../utils/getAssignmentsWithParticipantRemoved';
import { getRemovedAssignmentsAboveLimit } from '../utils/getRemovedAssignmentsAboveLimit';
import { isUnpopulatedRoom } from '../utils/isUnpopulatedRoom';

export function useOccupancyStrategy(totalNumberOfParticipants: number = 1) {
  const [limit, setLimit] = useState<number>(MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM);
  const [userAssignments, setUserAssignments] = useState<Assignments>({});
  const numberOfRooms = Math.floor(totalNumberOfParticipants / limit);
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set());

  // In this strategy, someone can leave and change the number of automatically created rooms.
  // This side effect needs to be handled, otherwise the user might end up in more rooms than expected on the way back.
  const systemAssignments: Assignments = useMemo(() => {
    const newSystemAssignments: Assignments = {};
    for (let i = 0; i < numberOfRooms; i++) {
      newSystemAssignments[i] = [];
    }
    Object.keys(userAssignments).forEach((roomIndex) => {
      const parsedRoomIndex = parseInt(roomIndex);
      if (parsedRoomIndex < numberOfRooms) {
        newSystemAssignments[parsedRoomIndex] = userAssignments[parsedRoomIndex];
      }
    });
    return newSystemAssignments;
  }, [userAssignments, numberOfRooms]);

  const handleLimitChange = (newLimit: number) => {
    setUserAssignments((userAssignments) => getRemovedAssignmentsAboveLimit(numberOfRooms, userAssignments));
    setLimit(newLimit);
    setExpandedRooms((expandedRooms) => {
      const newExpandedRooms = new Set(expandedRooms);
      range(0, numberOfRooms).forEach((roomIndex) => {
        if (roomIndex >= newLimit) {
          newExpandedRooms.delete(roomIndex);
        }
      });
      return newExpandedRooms;
    });
  };

  const necessaryNumberOfParticipants = numberOfRooms * MINIMUM_NUMBER_OF_PARTICIPANTS_PER_ROOM;

  const hasInsufficientParticipants = totalNumberOfParticipants < necessaryNumberOfParticipants;

  const hasUnpopulatedRooms = useMemo(() => {
    return range(0, numberOfRooms).some((roomIndex) => isUnpopulatedRoom(systemAssignments, roomIndex));
  }, [numberOfRooms, systemAssignments]);

  const hasInsufficientParticipantsInRooms = useMemo(() => {
    return range(0, numberOfRooms).some(
      (roomIndex) => isUnpopulatedRoom(systemAssignments, roomIndex) || systemAssignments[roomIndex].length < limit
    );
  }, [numberOfRooms, systemAssignments, limit]);

  const assignParticipantToRoom = useCallback((participantId: ParticipantId, roomIndex: number) => {
    setUserAssignments(getAssignmentsWithParticipantAdded(participantId, roomIndex));
  }, []);

  const removeParticipantFromRoom = useCallback((participantId: ParticipantId, roomIndex: number) => {
    setUserAssignments(getAssignmentsWithParticipantRemoved(participantId, roomIndex));
  }, []);

  const isAssignedToRoom = useCallback(
    (participantId: ParticipantId, roomIndex: number) => {
      return systemAssignments[roomIndex] ? systemAssignments[roomIndex].includes(participantId) : false;
    },
    [systemAssignments]
  );

  const clearAssignments = useCallback(() => {
    setUserAssignments({});
  }, []);

  const clearRoomAssignments = useCallback((roomIndex: number) => {
    setUserAssignments((existingAssignments) => {
      const newAssignments = { ...existingAssignments };
      delete newAssignments[roomIndex];
      return newAssignments;
    });
  }, []);

  const isAssignedToAnyRoom = useCallback(
    (participantId: ParticipantId) => {
      return Object.values(systemAssignments).some((assignedParticipants) =>
        assignedParticipants.includes(participantId)
      );
    },
    [systemAssignments]
  );

  const toBreakoutRooms = useCallback((): Array<BreakoutRoomConfig> => {
    return range(0, numberOfRooms).map((roomIndex) => ({
      name: `Room ${roomIndex + 1}`,
      assignments: (systemAssignments[roomIndex] || []) as Array<ParticipantId>,
    }));
  }, [systemAssignments, numberOfRooms]);

  const toRandomBreakoutRoomPlaceholders = useCallback((): Array<{ name: string; assignments: Array<number> }> => {
    // 1. Shuffle participants.
    const shuffledIndexes = shuffle(range(0, totalNumberOfParticipants));

    // 2. Assign required number of participants to each room.
    const placeholders: Array<{ name: string; assignments: Array<number> }> = [];
    let participantIndex = 0;
    for (let roomIndex = 0; roomIndex < numberOfRooms; roomIndex++) {
      for (let i = 0; i < limit && participantIndex < totalNumberOfParticipants; i++) {
        if (!placeholders[roomIndex]) {
          placeholders[roomIndex] = { name: `Room ${roomIndex + 1}`, assignments: [] };
        }
        placeholders[roomIndex].assignments.push(shuffledIndexes[participantIndex]);
        participantIndex++;
      }
    }

    // 3. Since number of rooms is calculated based on the ceil, there might be some participants left. Assign them to rooms in a round-robin manner.
    if (participantIndex < totalNumberOfParticipants) {
      let roomIndex = 0;
      while (participantIndex < totalNumberOfParticipants) {
        if (!placeholders[roomIndex]) {
          placeholders[roomIndex] = { name: `Room ${roomIndex + 1}`, assignments: [] };
        }
        placeholders[roomIndex].assignments.push(shuffledIndexes[participantIndex]);
        participantIndex++;
        roomIndex = (roomIndex + 1) % numberOfRooms;
      }
    }

    return placeholders;
  }, [totalNumberOfParticipants, numberOfRooms, limit]);

  return {
    limit,
    handleLimitChange,
    numberOfRooms,
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
