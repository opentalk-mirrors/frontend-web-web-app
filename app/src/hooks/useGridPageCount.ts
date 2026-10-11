// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

import { selectOnlineConnectionsTotal } from '../store/slices/participantsSlice';
import useConferenceUiVersion from './useConferenceUiVersion';
import { useAppSelector } from './useCustomRedux';
import { useGridPageSize } from './useGridPageSize';

// Number of grid pages for the current page size.
// Based on tile count rather than on participants: every connection has a tile and in V2 a screen share adds one more.
// We just need a tile count without ordering. To improve the performance we calculate it here rather than using useOrderedTiles hook
export function useGridPageCount() {
  const { isV2 } = useConferenceUiVersion();
  const connectionsTotal = useAppSelector(selectOnlineConnectionsTotal);
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
    ],
  });
  const gridPageSize = useGridPageSize();

  // V2-CLEANUP: In V1 a participant has only one tile. In V2 screen share gets additional tile
  const screenShareTiles = isV2
    ? remoteParticipants.filter((remoteParticipant) => remoteParticipant.isScreenShareEnabled).length
    : 0;

  return Math.ceil((connectionsTotal + screenShareTiles) / gridPageSize);
}
