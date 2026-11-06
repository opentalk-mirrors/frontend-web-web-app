// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { range } from 'es-toolkit';

import { CinemaViewSortOrder } from '../store/slices/common';
import { ParticipationKind, Role } from '../types';
import { shuffleArrayItems } from '../utils/arrayUtils';
import { mockedParticipant, mockStore, renderHookWithProviders } from '../utils/testUtils';
import { CinemaViewParticipant, useCinemaViewParticipants } from './useCinemaViewParticipants';

const mockUseRemoteParticipants = vi.fn();
const mockUseSortedParticipants = vi.fn(() => []);
vi.mock('@livekit/components-react', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@mui/material');

  return {
    ...actual,
    useSortedParticipants: () => mockUseSortedParticipants(),
    useRemoteParticipants: () => mockUseRemoteParticipants(),
  };
});

// Only provides the LiveKit state, role and participation kind are taken from the store by the hook.
const mockedRemoteParticipants = (total: number, usersWithCameraOn = 0) => {
  const participants = range(total).map((id) => {
    const base = mockedParticipant(id);
    return {
      ...base,
      // Align identity with connection identifier for remote participant mapping in hook
      identity: base.identity,
      isCameraEnabled: id < usersWithCameraOn,
    };
  });
  return shuffleArrayItems(participants);
};

describe('useCinemaViewParticipants hook', () => {
  describe('sort order: join time', () => {
    mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10));
    const { store } = mockStore(10, {
      randomizeJoinTime: true,
      store: {
        initialState: {
          ui: { cinemaViewOrder: CinemaViewSortOrder.FirstJoined },
        },
      },
    });

    const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
    const { cinemaViewParticipants } = result.current;

    it('should return participants sorted by join time', () => {
      range(8).forEach((index) => {
        const firstParticipantJoinTime = new Date(cinemaViewParticipants[index].joinedAt).getTime();
        const secondParticipantJoinTime = new Date(cinemaViewParticipants[index + 1].joinedAt).getTime();
        expect(firstParticipantJoinTime).toBeLessThanOrEqual(secondParticipantJoinTime);
      });
    });
  });

  describe('sort order: cameras first', () => {
    mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10, 3));
    const { store } = mockStore(10, {
      randomizeJoinTime: true,
    });

    const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
    const { cinemaViewParticipants } = result.current;
    const enabledCameraCount = cinemaViewParticipants.reduce((sum, p) => sum + (p.isCameraEnabled ? 1 : 0), 0);

    it('should return participants sorted by active cameras first (default option)', () => {
      expect(enabledCameraCount).toBe(3);
      expect(cinemaViewParticipants[enabledCameraCount - 1].isCameraEnabled).toBe(true);
      expect(cinemaViewParticipants[enabledCameraCount - 1]).not.toEqual(cinemaViewParticipants[enabledCameraCount]);
    });
  });

  describe('sort order: moderators first', () => {
    enum Group {
      Moderator,
      WithAccount,
      WithoutAccount,
    }
    const groupOf = (participant: CinemaViewParticipant) => {
      if (participant.role === Role.Moderator) {
        return Group.Moderator;
      }
      return participant.participationKind === ParticipationKind.Registered ? Group.WithAccount : Group.WithoutAccount;
    };

    // Uninvited participants with an account have the guest role but belong to the participants with an account.
    // The participants are stored in reverse of the expected order with equal join times, so the join time
    // tiebreaker cannot produce the expected order by chance.
    const mockedParticipants = [
      ...range(3).map(() => ({ role: Role.Guest, kind: ParticipationKind.Unregistered })),
      ...range(3).map(() => ({ role: Role.Guest, kind: ParticipationKind.Registered })),
      ...range(2).map(() => ({ role: Role.User, kind: ParticipationKind.Registered })),
      ...range(2).map(() => ({ role: Role.Moderator, kind: ParticipationKind.Registered })),
    ];
    mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10));
    const { store } = mockStore(10, {
      role: mockedParticipants.map(({ role }) => role),
      participantKinds: mockedParticipants.map(({ kind }) => kind),
      store: {
        initialState: {
          ui: { cinemaViewOrder: CinemaViewSortOrder.ModeratorsFirst },
        },
      },
    });

    const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
    const { cinemaViewParticipants } = result.current;

    it('should sort moderators first, participants with an account next and participants without one last', () => {
      expect(cinemaViewParticipants.map(groupOf)).toEqual([
        ...range(2).map(() => Group.Moderator),
        ...range(5).map(() => Group.WithAccount),
        ...range(3).map(() => Group.WithoutAccount),
      ]);
    });
  });
});
