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
  users?: number;
  guests?: number;
};
const mockedRemoteParticipants = (
  total: number,
  options: mockedRemoteParticipantOptions = { usersWithCameraOn: 0, moderators: 0, users: total, guests: 0 }
) => {
  const participantIds = range(total);
  let [generatedUsersWithCameraOn, generatedModerators, generatedUsers, generatedGuests] = [0, 0, 0, 0];
  const participants = participantIds.map((id) => {
    let isCameraEnabled = false;
    let role: Role = Role.User;
    if (generatedUsersWithCameraOn < options.usersWithCameraOn!) {
      isCameraEnabled = true;
      generatedUsersWithCameraOn++;
    }
    if (generatedModerators < options.moderators!) {
      role = Role.Moderator;
      generatedModerators++;
    } else if (generatedUsers < options.users!) {
      generatedUsers++;
    } else if (generatedGuests < options.guests!) {
      role = Role.Guest;
      generatedGuests++;
    }
    const kind = role === Role.Guest ? ParticipationKind.Guest : ParticipationKind.User;

    return {
      ...mockedParticipant(id, kind, role),
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
  describe('sort order: sort by roles', () => {
    const countRoles = (participants: CinemaViewParticipant[], role: Role) =>
      participants.reduce((sum, p) => sum + (p.role === role ? 1 : 0), 0);
    describe('given all 3 roles of user in a conference', () => {
      mockUseRemoteParticipants.mockImplementation(() =>
        mockedRemoteParticipants(10, { moderators: 3, users: 4, guests: 3 })
      );
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

      it('should sort moderators first, users next and guests last', () => {
        const moderatorCount = countRoles(cinemaViewParticipants, Role.Moderator);
        const userCount = countRoles(cinemaViewParticipants, Role.User);
        const guestCount = countRoles(cinemaViewParticipants, Role.Guest);
        range(0, moderatorCount).forEach((index) => expect(cinemaViewParticipants[index].role).toBe(Role.Moderator));
        range(moderatorCount, moderatorCount + userCount).forEach((index) =>
          expect(cinemaViewParticipants[index].role).toBe(Role.User)
        );
        range(moderatorCount + userCount, moderatorCount + userCount + guestCount).forEach((index) =>
          expect(cinemaViewParticipants[index].role).toBe(Role.Guest)
        );
      });
    });
    describe('given only users and guests are present', () => {
      mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10, { users: 7, guests: 3 }));
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
      it('should sort users first and guests last', () => {
        const userCount = countRoles(cinemaViewParticipants, Role.User);
        const guestCount = countRoles(cinemaViewParticipants, Role.Guest);
        range(0, userCount).forEach((index) => expect(cinemaViewParticipants[index].role).toBe(Role.User));
        range(userCount, userCount + guestCount).forEach((index) =>
          expect(cinemaViewParticipants[index].role).toBe(Role.Guest)
        );
      });
    });
    describe('given only moderators and guests are present', () => {
      mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10, { moderators: 3, guests: 7 }));
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
      it('should sort moderators first and guests last', () => {
        const moderatorCount = countRoles(cinemaViewParticipants, Role.Moderator);
        const guestCount = countRoles(cinemaViewParticipants, Role.Guest);
        range(0, moderatorCount).forEach((index) => expect(cinemaViewParticipants[index].role).toBe(Role.Moderator));
        range(moderatorCount, moderatorCount + guestCount).forEach((index) =>
          expect(cinemaViewParticipants[index].role).toBe(Role.Guest)
        );
      });
    });
    describe('given only moderators and users are present', () => {
      mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10, { moderators: 3, users: 7 }));
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
      it('should sort moderators first and guests last', () => {
        const moderatorCount = countRoles(cinemaViewParticipants, Role.Moderator);
        const userCount = countRoles(cinemaViewParticipants, Role.User);
        range(0, moderatorCount).forEach((index) => expect(cinemaViewParticipants[index].role).toBe(Role.Moderator));
        range(moderatorCount, moderatorCount + userCount).forEach((index) =>
          expect(cinemaViewParticipants[index].role).toBe(Role.User)
        );
      });
    });
  });
});
