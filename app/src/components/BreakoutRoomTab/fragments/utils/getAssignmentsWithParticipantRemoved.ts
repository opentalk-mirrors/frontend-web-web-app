// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantId } from '../../../../types';
import { Assignments } from '../types/assignments';

export function getAssignmentsWithParticipantRemoved(participantId: ParticipantId, roomIndex: number) {
  return (existingAssignments: Assignments): Assignments => {
    const newAssignments = { ...existingAssignments };
    if (newAssignments[roomIndex]?.includes(participantId)) {
      newAssignments[roomIndex] = newAssignments[roomIndex].filter((id) => id !== participantId);
    }
    return newAssignments;
  };
}
