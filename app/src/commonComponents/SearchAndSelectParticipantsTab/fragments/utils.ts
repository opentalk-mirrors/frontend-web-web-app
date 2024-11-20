// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RemoteParticipant } from 'livekit-client';

import { SelectableParticipant } from './SelectParticipantsItem';

// This helper preserves the methods and prototype chain of the RemoteParticipant object
// The spread operator only copies properties, whereas Object.assign with Object.create
// ensures the full object structure, including methods, is maintained
export const toSelectableParticipant = (participant: RemoteParticipant, isSelected: boolean): SelectableParticipant => {
  return Object.assign(Object.create(participant), participant, { selected: isSelected });
};
