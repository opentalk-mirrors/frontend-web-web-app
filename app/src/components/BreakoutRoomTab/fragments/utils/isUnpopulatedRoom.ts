// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Assignments } from '../types/assignments';

export function isUnpopulatedRoom(assignments: Assignments, roomIndex: number) {
  return !assignments[roomIndex] || assignments[roomIndex].length === 0;
}
