// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

/**
 * The whiteboard throttles its outgoing messages, so scene updates can still be scheduled
 * when we leave a room. The roomserver applies every message to the room we are currently
 * in, which would submit the scene of the old room to the new one.
 *
 * The whiteboard registers a reset that drops its scheduled messages and its internal scene
 * tracking. The breakout flow runs that reset before it switches rooms, and the whiteboard
 * stops scheduling messages while a switch is pending.
 */

let resetWhiteboardSync: (() => void) | undefined;
let roomSwitchPending = false;

export const registerWhiteboardSyncReset = (reset: () => void) => {
  resetWhiteboardSync = reset;

  return () => {
    if (resetWhiteboardSync === reset) {
      resetWhiteboardSync = undefined;
    }
  };
};

export const beginWhiteboardRoomSwitch = () => {
  roomSwitchPending = true;
  resetWhiteboardSync?.();
};

// The roomserver can also move us without us asking for it, so this is the first chance to
// drop the state of the old room when the switch was not initiated by us.
export const endWhiteboardRoomSwitch = () => {
  resetWhiteboardSync?.();
  roomSwitchPending = false;
};

// A rejected switch leaves us in the room we are already in, so the scene stays valid.
export const abortWhiteboardRoomSwitch = () => {
  roomSwitchPending = false;
};

export const isWhiteboardRoomSwitchPending = () => roomSwitchPending;
