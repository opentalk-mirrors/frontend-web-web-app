// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ModeratorJoinInfo, WaitingRoom } from '../../types';
import reducer, { setModeratorData } from './moderationSlice';

const buildModeratorData = (overrides: Partial<ModeratorJoinInfo> = {}): ModeratorJoinInfo => ({
  raiseHandsEnabled: true,
  guestAccess: true,
  waitingRoomParticipants: [],
  waitingRoom: WaitingRoom.Disabled,
  ...overrides,
});

describe('moderationSlice', () => {
  describe('setModeratorData', () => {
    it('hydrates the waiting room and guest access from the moderator data', () => {
      const moderatorData = buildModeratorData({
        waitingRoom: WaitingRoom.ForEveryone,
        guestAccess: false,
      });

      const state = reducer(undefined, setModeratorData({ moderatorData }));

      expect(state.waitingRoom).toBe(WaitingRoom.ForEveryone);
      expect(state.guestAccessEnabled).toBe(false);
    });

    it('overrides the previous waiting room and guest access state', () => {
      let state = reducer(undefined, setModeratorData({ moderatorData: buildModeratorData() }));
      expect(state.waitingRoom).toBe(WaitingRoom.Disabled);
      expect(state.guestAccessEnabled).toBe(true);

      state = reducer(
        state,
        setModeratorData({
          moderatorData: buildModeratorData({ waitingRoom: WaitingRoom.ForGuests, guestAccess: false }),
        })
      );

      expect(state.waitingRoom).toBe(WaitingRoom.ForGuests);
      expect(state.guestAccessEnabled).toBe(false);
    });
  });
});
