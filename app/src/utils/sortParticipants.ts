// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { partition, sortBy } from 'es-toolkit';

import { Participant, SortOption } from '../types';
import { shuffleArrayItems } from './arrayUtils';

export type SortableParticipant = Pick<
  Participant,
  'displayName' | 'joinedAt' | 'handUpdatedAt' | 'lastActive' | 'handIsUp'
>;

function sortByRaisedHand<T extends SortableParticipant>(participants: Array<T>): Array<T> {
  return sortBy(participants, [
    (participant) => participant.handIsUp && participant.handUpdatedAt && new Date(participant.handUpdatedAt),
  ]);
}

function sortByDisplayName<T extends SortableParticipant>(participants: Array<T>): Array<T> {
  return sortBy(participants, ['displayName']);
}

function getSortedByRaisedHandFirst<T extends SortableParticipant>(participants: T[]) {
  const [participantsWithRaisedHands, participantsWithoutRaisedHands] = partition(
    participants,
    (participant) => !!participant.handIsUp
  );

  return sortByRaisedHand(participantsWithRaisedHands).concat(sortByDisplayName(participantsWithoutRaisedHands));
}

export const sortParticipantsWithConfig =
  (config: { language: string }) =>
  <T extends SortableParticipant>(participants: T[], sortOption: SortOption): T[] => {
    const localParticipants = [...participants];

    switch (sortOption) {
      case SortOption.NameASC:
        return localParticipants.sort((a, b) =>
          a.displayName.localeCompare(b.displayName, config.language, { ignorePunctuation: true })
        );
      case SortOption.NameDESC:
        return localParticipants.sort((a, b) =>
          b.displayName.localeCompare(a.displayName, config.language, { ignorePunctuation: true })
        );
      case SortOption.FirstJoin:
        return localParticipants.sort((a, b) => Date.parse(a.joinedAt) - Date.parse(b.joinedAt));
      case SortOption.LastJoin:
        return localParticipants.sort((a, b) => Date.parse(b.joinedAt) - Date.parse(a.joinedAt));
      case SortOption.RaisedHandFirst: {
        return getSortedByRaisedHandFirst(localParticipants);
      }
      case SortOption.LastActive:
        return localParticipants.sort((a, b) => Date.parse(b.lastActive) - Date.parse(a.lastActive));
      case SortOption.Random:
        return localParticipants.length > 1 ? shuffleArrayItems(localParticipants) : localParticipants;
      default:
        return localParticipants;
    }
  };
