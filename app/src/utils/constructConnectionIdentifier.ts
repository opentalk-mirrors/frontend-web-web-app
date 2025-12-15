// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ConnectionId, ParticipantId, ConnectionIdentifier } from '../types';

export const constructConnectionIdentifier = (id: ParticipantId, connection: ConnectionId) => {
  return `${id}:${connection}` as ConnectionIdentifier;
};
