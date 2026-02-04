// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { range } from 'lodash';

import { CinemaViewSortOrder } from '../store/slices/common';
import { ParticipationKind, Role } from '../types';
import { shuffleArrayItems } from '../utils/arrayUtils';
import { mockedParticipant, mockStore, renderHookWithProviders } from '../utils/testUtils';
import { CinemaViewParticipant, useCinemaViewParticipants } from './useCinemaViewParticipants';

const mockUseRemoteParticipants = vi.fn();
vi.mock('@livekit/components-react', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@mui/material');

  return {
    ...actual,
    useRemoteParticipants: () => mockUseRemoteParticipants(),
  };
});

type mockedRemoteParticipantOptions = {
  usersWithCameraOn?: number;
  moderators?: number;
  registeredUsers?: number;
  guests?: number;
};
const mockedRemoteParticipants = (
  total: number,
  options: mockedRemoteParticipantOptions = { usersWithCameraOn: 0, moderators: 0, registeredUsers: total, guests: 0 }
) => {
  const participantIds = range(total);
  let [generatedUsersWithCameraOn, generatedModerators, generatedRegistered, generatedGuests] = [0, 0, 0, 0];
  const participants = participantIds.map((id) => {
    let isCameraEnabled = false;
    let role: Role = Role.User;
    let kind: ParticipationKind = ParticipationKind.Registered;
    if (generatedUsersWithCameraOn < options.usersWithCameraOn!) {
      isCameraEnabled = true;
      generatedUsersWithCameraOn++;
    }
    if (generatedModerators < options.moderators!) {
      role = Role.Moderator;
      generatedModerators++;
    } else if (generatedRegistered < options.registeredUsers!) {
      kind = ParticipationKind.Registered;
      generatedRegistered++;
    } else if (generatedGuests < options.guests!) {
      kind = ParticipationKind.Guest;
      generatedGuests++;
    }

    const base = mockedParticipant(id, kind, role);
    return {
      ...base,
      // Align identity with id for remote participant mapping in hook
      identity: base.id,
      isCameraEnabled,
    };
  });
  return shuffleArrayItems(participants);
};

describe('useCinemaViewParticipants hook', () => {
  describe('sort order: join time', () => {
    mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10));
    const { store } = mockStore(10, {
      randomizeJoinTime: true,
    });

    const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
    const { cinemaViewParticipants } = result.current;
    it('should return participants sorted by join time (default option)', () => {
      range(8).forEach((index) => {
        const firstParticipantJoinTime = new Date(cinemaViewParticipants[index].joinedAt).getTime();
        const secondParticipantJoinTime = new Date(cinemaViewParticipants[index + 1].joinedAt).getTime();
        expect(firstParticipantJoinTime).toBeLessThanOrEqual(secondParticipantJoinTime);
      });
    });
  });
  describe('sort order: cameras first', () => {
    mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10, { usersWithCameraOn: 3 }));
    const { store } = mockStore(10, {
      randomizeJoinTime: true,
      store: {
        initialState: {
          ui: { cinemaViewOrder: CinemaViewSortOrder.VideoFirst },
        },
      },
    });

    const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
    const { cinemaViewParticipants } = result.current;
    const enabledCameraCount = cinemaViewParticipants.reduce((sum, p) => sum + (p.isCameraEnabled ? 1 : 0), 0);
    it('should return participants sorted by active cameras first', () => {
      expect(enabledCameraCount).toBe(3);
      expect(cinemaViewParticipants[enabledCameraCount - 1].isCameraEnabled).toBe(true);
      expect(cinemaViewParticipants[enabledCameraCount - 1]).not.toEqual(cinemaViewParticipants[enabledCameraCount]);
    });
  });
  describe('sort order: moderators first', () => {
    const countByRole = (participants: CinemaViewParticipant[], role: Role) =>
      participants.reduce((sum, p) => sum + (p.role === role ? 1 : 0), 0);
    const countByKind = (participants: CinemaViewParticipant[], kind: ParticipationKind) =>
      participants.reduce((sum, p) => sum + (p.participationKind === kind ? 1 : 0), 0);
    describe('given moderators, registered users and guests', () => {
      mockUseRemoteParticipants.mockImplementation(() =>
        mockedRemoteParticipants(10, { moderators: 3, registeredUsers: 4, guests: 3 })
      );
      const { store } = mockStore(10, {
        randomizeJoinTime: true,
        store: {
          initialState: {
            ui: { cinemaViewOrder: CinemaViewSortOrder.ModeratorsFirst },
          },
        },
      });

      const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
      const { cinemaViewParticipants } = result.current;

      it('should sort moderators first, registered users next and guests last', () => {
        const moderatorCount = countByRole(cinemaViewParticipants, Role.Moderator);
        const registeredCount = countByKind(cinemaViewParticipants, ParticipationKind.Registered);
        const guestCount = countByKind(cinemaViewParticipants, ParticipationKind.Guest);
        range(0, moderatorCount).map((index) => expect(cinemaViewParticipants[index].role).toBe(Role.Moderator));
        range(moderatorCount, moderatorCount + registeredCount).map((index) =>
          expect(cinemaViewParticipants[index].participationKind).toBe(ParticipationKind.Registered)
        );
        range(moderatorCount + registeredCount, moderatorCount + registeredCount + guestCount).map((index) =>
          expect(cinemaViewParticipants[index].participationKind).toBe(ParticipationKind.Guest)
        );
      });
    });
    describe('given only registered users and guests are present', () => {
      mockUseRemoteParticipants.mockImplementation(() =>
        mockedRemoteParticipants(10, { registeredUsers: 7, guests: 3 })
      );
      const { store } = mockStore(10, {
        randomizeJoinTime: true,
        store: {
          initialState: {
            ui: { cinemaViewOrder: CinemaViewSortOrder.ModeratorsFirst },
          },
        },
      });

      const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
      const { cinemaViewParticipants } = result.current;
      it('should sort registered users first and guests last', () => {
        const registeredCount = countByKind(cinemaViewParticipants, ParticipationKind.Registered);
        const guestCount = countByKind(cinemaViewParticipants, ParticipationKind.Guest);
        range(0, registeredCount).map((index) =>
          expect(cinemaViewParticipants[index].participationKind).toBe(ParticipationKind.Registered)
        );
        range(registeredCount, registeredCount + guestCount).map((index) =>
          expect(cinemaViewParticipants[index].participationKind).toBe(ParticipationKind.Guest)
        );
      });
    });
    describe('given only moderators and guests are present', () => {
      mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10, { moderators: 3, guests: 7 }));
      const { store } = mockStore(10, {
        randomizeJoinTime: true,
        store: {
          initialState: {
            ui: { cinemaViewOrder: CinemaViewSortOrder.ModeratorsFirst },
          },
        },
      });

      const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
      const { cinemaViewParticipants } = result.current;
      it('should sort moderators first and guests last', () => {
        const moderatorCount = countByRole(cinemaViewParticipants, Role.Moderator);
        const guestCount = countByKind(cinemaViewParticipants, ParticipationKind.Guest);
        range(0, moderatorCount).map((index) => expect(cinemaViewParticipants[index].role).toBe(Role.Moderator));
        range(moderatorCount, moderatorCount + guestCount).map((index) =>
          expect(cinemaViewParticipants[index].participationKind).toBe(ParticipationKind.Guest)
        );
      });
    });
    describe('given only moderators and registered users are present', () => {
      mockUseRemoteParticipants.mockImplementation(() =>
        mockedRemoteParticipants(10, { moderators: 3, registeredUsers: 7 })
      );
      const { store } = mockStore(10, {
        randomizeJoinTime: true,
        store: {
          initialState: {
            ui: { cinemaViewOrder: CinemaViewSortOrder.ModeratorsFirst },
          },
        },
      });

      const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
      const { cinemaViewParticipants } = result.current;
      it('should sort moderators first and guests last', () => {
        const moderatorCount = countByRole(cinemaViewParticipants, Role.Moderator);
        const registeredCount = countByKind(cinemaViewParticipants, ParticipationKind.Registered);
        range(0, moderatorCount).map((index) => expect(cinemaViewParticipants[index].role).toBe(Role.Moderator));
        range(moderatorCount, moderatorCount + registeredCount).map((index) =>
          expect(cinemaViewParticipants[index].participationKind).toBe(ParticipationKind.Registered)
        );
      });
    });
  });
});
