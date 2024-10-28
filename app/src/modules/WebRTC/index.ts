// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MediaSessionState, MediaSessionType, ParticipantId } from '../../types';
import { ConferenceRoom } from './ConferenceRoom';

export { ConferenceRoom };

/* TODO: find a better place to hold the ConferenceRoom state object.
  options:
   - a RoomProvider, but not accessible from the middleware
   - in the store, but it is not serializable
   - a singleton as global state
 */

export interface MediaDescriptor {
  participantId: ParticipantId;
  mediaType: MediaSessionType;
}

export type MediaId = string & { readonly __tag: unique symbol };

export const idFromDescriptor = (descriptor: MediaDescriptor): MediaId =>
  `${descriptor.participantId}/${descriptor.mediaType}` as MediaId;

export const descriptorFromId = (id: MediaId): MediaDescriptor => {
  const [participantId, mediaType] = id.split('/');
  return { participantId: participantId as ParticipantId, mediaType: mediaType as MediaSessionType };
};

export type SubscriberConfig = MediaDescriptor & MediaSessionState;

export const PACKET_LOSS_THRESHOLD = 0.1; //10%
let currentConferenceRoom: ConferenceRoom | undefined = undefined;

export const setCurrentConferenceRoom = (room: ConferenceRoom) => {
  currentConferenceRoom = room;
  const shutdownHandler = () => {
    currentConferenceRoom?.removeEventListener('shutdown', shutdownHandler);
    currentConferenceRoom = undefined;
  };
  currentConferenceRoom.addEventListener('shutdown', shutdownHandler);
};

export const getCurrentConferenceRoom = () => {
  return currentConferenceRoom;
};

export const shutdownConferenceContext = () => {
  if (currentConferenceRoom === undefined) {
    throw new Error('conferenceContext already shut');
  }
  currentConferenceRoom.shutdown();
};
