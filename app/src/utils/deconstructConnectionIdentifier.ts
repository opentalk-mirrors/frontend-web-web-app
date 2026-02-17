// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ConnectionId, ParticipantId, ConnectionIdentifier } from '../types';

export const deconstructConnectionIdentifier = (identity: ConnectionIdentifier) => {
  const [participantId, connectionId] = identity.split(':') as [ParticipantId, ConnectionId];
  return { participantId, connectionId };
};
