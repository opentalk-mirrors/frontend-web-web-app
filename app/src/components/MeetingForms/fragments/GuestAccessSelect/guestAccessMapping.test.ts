// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { GuestAccess } from '@opentalk/rest-api-rtk-query';

import { computeFormValues, deriveUiState, WaitingRoomMode } from './guestAccessMapping';

describe('guestAccessMapping', () => {
  describe('deriveUiState', () => {
    it.each([
      [{ waitingRoom: false, guestAccess: GuestAccess.Disabled }, WaitingRoomMode.Inactive, false],
      [{ waitingRoom: true, guestAccess: GuestAccess.Disabled }, WaitingRoomMode.AllParticipants, false],
      [{ waitingRoom: false, guestAccess: GuestAccess.DirectAccess }, WaitingRoomMode.Inactive, true],
      [{ waitingRoom: true, guestAccess: GuestAccess.WaitingRoom }, WaitingRoomMode.AllParticipants, true],
      [{ waitingRoom: false, guestAccess: GuestAccess.WaitingRoom }, WaitingRoomMode.GuestsOnly, true],
    ] as const)('maps %j → mode=%s, ga=%s', (values, mode, gaEnabled) => {
      expect(deriveUiState(values)).toEqual({ guestAccessEnabled: gaEnabled, waitingRoomMode: mode });
    });

    it('treats the contradictory (waitingRoom=true, ga=DirectAccess) state as "all-participants"', () => {
      expect(deriveUiState({ waitingRoom: true, guestAccess: GuestAccess.DirectAccess })).toEqual({
        guestAccessEnabled: true,
        waitingRoomMode: WaitingRoomMode.AllParticipants,
      });
    });
  });

  describe('computeFormValues', () => {
    it.each([
      [WaitingRoomMode.Inactive, false, { waitingRoom: false, guestAccess: GuestAccess.Disabled }],
      [WaitingRoomMode.Inactive, true, { waitingRoom: false, guestAccess: GuestAccess.DirectAccess }],
      [WaitingRoomMode.AllParticipants, false, { waitingRoom: true, guestAccess: GuestAccess.Disabled }],
      [WaitingRoomMode.AllParticipants, true, { waitingRoom: true, guestAccess: GuestAccess.WaitingRoom }],
      [WaitingRoomMode.GuestsOnly, true, { waitingRoom: false, guestAccess: GuestAccess.WaitingRoom }],
      [WaitingRoomMode.GuestsOnly, false, { waitingRoom: false, guestAccess: GuestAccess.Disabled }],
    ])('maps mode=%s, gaEnabled=%s → %j', (mode, gaEnabled, expected) => {
      expect(computeFormValues({ waitingRoomMode: mode, guestAccessEnabled: gaEnabled })).toEqual(expected);
    });
  });

  describe('round-trip', () => {
    it('is stable for every reachable UI state', () => {
      const cases = [
        [WaitingRoomMode.Inactive, false],
        [WaitingRoomMode.Inactive, true],
        [WaitingRoomMode.AllParticipants, false],
        [WaitingRoomMode.AllParticipants, true],
        [WaitingRoomMode.GuestsOnly, true],
      ] as const;
      for (const [mode, gaEnabled] of cases) {
        const formValues = computeFormValues({ waitingRoomMode: mode, guestAccessEnabled: gaEnabled });
        expect(deriveUiState(formValues)).toEqual({ guestAccessEnabled: gaEnabled, waitingRoomMode: mode });
      }
    });
  });
});
