// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantContext } from '@livekit/components-react';
import { Participant, RemoteParticipant } from 'livekit-client';
import { ReactNode, useMemo } from 'react';

import { ConnectionIdentifier } from '../../types';

interface TileParticipantProviderProps {
  connectionIdentifier: ConnectionIdentifier;
  displayName: string;
  remoteParticipant?: RemoteParticipant;
  children: ReactNode;
}

/**
 * Provides the LiveKit participant for a tile.
 * In case a Livekit participant is not available (e.g. no connection LiveKit)
 * create a fallback participant using data from the controller.
 */
const TileParticipantProvider = ({
  connectionIdentifier,
  displayName,
  remoteParticipant,
  children,
}: TileParticipantProviderProps) => {
  const participant = useMemo(
    () => remoteParticipant ?? new Participant(connectionIdentifier, connectionIdentifier, displayName),
    [remoteParticipant, connectionIdentifier, displayName]
  );

  return <ParticipantContext.Provider value={participant}>{children}</ParticipantContext.Provider>;
};

export default TileParticipantProvider;
