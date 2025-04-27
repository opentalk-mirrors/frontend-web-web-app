// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SortOption } from '../types';
import { SortableParticipant, sortParticipantsWithConfig } from './sortParticipants';

describe('sortParticipants(language)(participants, sortOption).', () => {
  const language = 'en';
  const sortParticipants = sortParticipantsWithConfig({ language });
  const participants: SortableParticipant[] = [
    {
      displayName: 'Albert',
      handIsUp: true,
      handUpdatedAt: new Date('2023-03-04 14:01:45').toISOString(),
      joinedAt: new Date('2023-03-04 14:00:00').toISOString(),
      lastActive: new Date('2023-03-04 14:01:00').toISOString(),
    },
    {
      displayName: 'Marcus',
      handIsUp: false,
      joinedAt: new Date('2023-03-04 14:00:30').toISOString(),
      lastActive: new Date('2023-03-04 14:02:30').toISOString(),
    },
    {
      displayName: 'Stefan',
      handIsUp: true,
      handUpdatedAt: new Date('2023-03-04 14:01:30').toISOString(),
      joinedAt: new Date('2023-03-04 14:01:00').toISOString(),
      lastActive: new Date('2023-03-04 14:02:00').toISOString(),
    },
  ];

  describe('SortOption:Name', () => {
    it('should sort by name descending.', () => {
      const expected = [participants[2], participants[1], participants[0]];

      expect(sortParticipants(participants, SortOption.NameDESC)).toEqual(expected);
    });

    it('should sort by name ascending.', () => {
      expect(sortParticipants(participants, SortOption.NameASC)).toEqual(participants);
    });
  });

  describe('SortOption:Join', () => {
    it('should sort by last joined.', () => {
      const expected = [participants[2], participants[1], participants[0]];

      expect(sortParticipants(participants, SortOption.LastJoin)).toEqual(expected);
    });

    it('should sort by first joined.', () => {
      expect(sortParticipants(participants, SortOption.FirstJoin)).toEqual(participants);
    });
  });

  describe('SortOption:Active', () => {
    it('should sort by last active', () => {
      const expected = [participants[1], participants[2], participants[0]];

      expect(sortParticipants(participants, SortOption.LastActive)).toEqual(expected);
    });
  });

  describe('SortOption:HandRaised', () => {
    it('should sort by first raised hand', () => {
      const expected = [participants[2], participants[0], participants[1]];

      expect(sortParticipants(participants, SortOption.RaisedHandFirst)).toEqual(expected);
    });
  });

  describe('SortOption:Random', () => {
    it('should return participants in unpredictable order', () => {
      expect(sortParticipants(participants, SortOption.Random)).not.toEqual(participants);
    });
  });
});
