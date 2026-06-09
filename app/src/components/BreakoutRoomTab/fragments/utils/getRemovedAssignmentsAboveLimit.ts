// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Assignments } from '../types/assignments';

export function getRemovedAssignmentsAboveLimit(limit: number, assignments: Assignments) {
  const newAssignments: Assignments = {};
  for (let i = 0; i < limit; i++) {
    if (assignments[i]) {
      newAssignments[i] = assignments[i];
    }
  }
  return newAssignments;
}
