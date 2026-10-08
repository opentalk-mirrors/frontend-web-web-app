// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ConnectionIdentifier, MediaSessionType } from '../../types';
import { ConferenceRoom, getCurrentConferenceRoom } from './ConferenceRoom';

export { ConferenceRoom };

/* TODO: find a better place to hold the ConferenceRoom state object.
  options:
   - a RoomProvider, but not accessible from the middleware
   - in the store, but it is not serializable
   - a singleton as global state
 */

export interface MediaDescriptor {
  connectionIdentifier: ConnectionIdentifier;
  mediaType: MediaSessionType;
}

export type MediaId = string & { readonly __tag: unique symbol };

export const idFromDescriptor = (descriptor: MediaDescriptor): MediaId =>
  `${descriptor.connectionIdentifier}/${descriptor.mediaType}` as MediaId;

export const shutdownConferenceContext = () => {
  const currentConferenceRoom = getCurrentConferenceRoom();
  if (currentConferenceRoom === undefined) {
    throw new Error('conferenceContext already shut');
  }
  currentConferenceRoom.shutdown();
};
