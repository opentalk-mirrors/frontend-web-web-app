// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CinemaViewSortOrder } from '../store/slices/common';
import { ParticipationKind, Role } from '../types';
import { SortableCinemaViewParticipant, sortCinemaViewParticipants } from './sortCinemaViewParticipants';

describe('sortCinemaViewParticipants', () => {
  it('should return participants with the active camera first when the sort order is activeCameraFirst', () => {
    const participants: SortableCinemaViewParticipant[] = [
      {
        isCameraEnabled: false,
        role: Role.User,
        joinedAt: '2024-01-01',
        isSpeaking: false,
        participationKind: ParticipationKind.Registered,
      },
      {
        isCameraEnabled: true,
        role: Role.User,
        joinedAt: '2024-01-02',
        isSpeaking: false,
        participationKind: ParticipationKind.Registered,
      },
    ];
    const sorted = sortCinemaViewParticipants(participants, CinemaViewSortOrder.VideoFirst);
    expect(sorted).toEqual([participants[1], participants[0]]);
  });

  it('should return participants who joined earlier first when the sort order is firstJoined', () => {
    const participants: SortableCinemaViewParticipant[] = [
      {
        isCameraEnabled: false,
        role: Role.User,
        joinedAt: '2024-01-02',
        isSpeaking: false,
        participationKind: ParticipationKind.Registered,
      },
      {
        isCameraEnabled: true,
        role: Role.User,
        joinedAt: '2024-01-01',
        isSpeaking: false,
        participationKind: ParticipationKind.Registered,
      },
    ];
    const sorted = sortCinemaViewParticipants(participants, CinemaViewSortOrder.FirstJoined);
    expect(sorted).toEqual([participants[1], participants[0]]);
  });

  it('should return moderators first when the sort order is moderatorsFirst', () => {
    const participants: SortableCinemaViewParticipant[] = [
      {
        isCameraEnabled: false,
        role: Role.User,
        joinedAt: '2024-01-01',
        isSpeaking: false,
        participationKind: ParticipationKind.Registered,
      },
      {
        isCameraEnabled: true,
        role: Role.Moderator,
        joinedAt: '2024-01-02',
        isSpeaking: false,
        participationKind: ParticipationKind.Registered,
      },
    ];
    const sorted = sortCinemaViewParticipants(participants, CinemaViewSortOrder.ModeratorsFirst);
    expect(sorted).toEqual([participants[1], participants[0]]);
  });

  it('should prioritize registered users over guests when the sort order is moderatorsFirst and both participants have the same role', () => {
    const participants: SortableCinemaViewParticipant[] = [
      {
        isCameraEnabled: false,
        role: Role.User,
        joinedAt: '2024-01-01',
        isSpeaking: false,
        participationKind: ParticipationKind.Guest,
      },
      {
        isCameraEnabled: false,
        role: Role.User,
        joinedAt: '2024-01-01',
        isSpeaking: false,
        participationKind: ParticipationKind.Registered,
      },
    ];
    const sorted = sortCinemaViewParticipants(participants, CinemaViewSortOrder.ModeratorsFirst);
    expect(sorted).toEqual([participants[1], participants[0]]);
  });

  it('should sort by video first with joinedAt as a tiebreaker', () => {
    const participants: SortableCinemaViewParticipant[] = [
      {
        isCameraEnabled: false,
        role: Role.User,
        joinedAt: '2024-01-01',
        isSpeaking: false,
        participationKind: ParticipationKind.Registered,
      },
      {
        isCameraEnabled: false,
        role: Role.User,
        joinedAt: '2024-01-02',
        isSpeaking: false,
        participationKind: ParticipationKind.Registered,
      },
      {
        isCameraEnabled: true,
        role: Role.User,
        joinedAt: '2024-01-03',
        isSpeaking: false,
        participationKind: ParticipationKind.Registered,
      },
    ];
    const sorted = sortCinemaViewParticipants(participants, CinemaViewSortOrder.VideoFirst);
    expect(sorted).toEqual([participants[2], participants[0], participants[1]]);
  });
});
