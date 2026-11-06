// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { JoinSuccessInternalState, ParticipantId, ParticipationKind, Role } from '../../types';
import { joinSuccess } from '../commonActions';
import type { RootState } from '../index';
import reducer, { UserState, selectHasGuestRole, selectIsUnregistered } from './userSlice';

const buildJoinSuccessPayload = (role: Role, participationKind: ParticipationKind): JoinSuccessInternalState =>
  ({
    participantId: '00000000-0000-0000-0000-000000000001' as ParticipantId,
    role,
    participationKind,
    isRoomOwner: false,
    enabledModules: {},
  }) as unknown as JoinSuccessInternalState;

const asRootState = (user: UserState) => ({ user }) as RootState;

describe('userSlice', () => {
  describe('joinSuccess', () => {
    it('keeps an uninvited user with an account registered although they have the guest role', () => {
      const state = reducer(undefined, joinSuccess(buildJoinSuccessPayload(Role.Guest, ParticipationKind.Registered)));

      expect(state.role).toBe(Role.Guest);
      expect(state.participationKind).toBe(ParticipationKind.Registered);
    });

    it('marks a user without an account as guest participant', () => {
      const state = reducer(
        undefined,
        joinSuccess(buildJoinSuccessPayload(Role.Guest, ParticipationKind.Unregistered))
      );

      expect(state.role).toBe(Role.Guest);
      expect(state.participationKind).toBe(ParticipationKind.Unregistered);
    });

    it('marks an invited user as registered participant', () => {
      const state = reducer(undefined, joinSuccess(buildJoinSuccessPayload(Role.User, ParticipationKind.Registered)));

      expect(state.role).toBe(Role.User);
      expect(state.participationKind).toBe(ParticipationKind.Registered);
    });
  });

  describe('selectors', () => {
    it.each([
      [Role.Guest, ParticipationKind.Registered, false, true],
      [Role.Guest, ParticipationKind.Unregistered, true, true],
      [Role.User, ParticipationKind.Registered, false, false],
      [Role.Moderator, ParticipationKind.Registered, false, false],
    ])(
      'with role %s and participation kind %s, selectIsUnregistered is %s and selectHasGuestRole is %s',
      (role, participationKind, isUnregistered, hasGuestRole) => {
        const state = asRootState(reducer(undefined, joinSuccess(buildJoinSuccessPayload(role, participationKind))));

        expect(selectIsUnregistered(state)).toBe(isUnregistered);
        expect(selectHasGuestRole(state)).toBe(hasGuestRole);
      }
    );
  });
});
