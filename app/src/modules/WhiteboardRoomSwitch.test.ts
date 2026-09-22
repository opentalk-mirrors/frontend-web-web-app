// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  abortWhiteboardRoomSwitch,
  beginWhiteboardRoomSwitch,
  endWhiteboardRoomSwitch,
  isWhiteboardRoomSwitchPending,
  registerWhiteboardSyncReset,
} from './WhiteboardRoomSwitch';

describe('WhiteboardRoomSwitch', () => {
  afterEach(() => {
    endWhiteboardRoomSwitch();
  });

  it('resets the whiteboard sync and marks the switch as pending when it begins', () => {
    const reset = vi.fn();
    registerWhiteboardSyncReset(reset);

    beginWhiteboardRoomSwitch();

    expect(reset).toHaveBeenCalledOnce();
    expect(isWhiteboardRoomSwitchPending()).toBe(true);
  });

  it('resets the whiteboard sync again when the switch ends', () => {
    const reset = vi.fn();
    registerWhiteboardSyncReset(reset);

    beginWhiteboardRoomSwitch();
    endWhiteboardRoomSwitch();

    expect(reset).toHaveBeenCalledTimes(2);
    expect(isWhiteboardRoomSwitchPending()).toBe(false);
  });

  it('keeps the whiteboard sync intact when the switch is aborted', () => {
    const reset = vi.fn();
    registerWhiteboardSyncReset(reset);

    beginWhiteboardRoomSwitch();
    reset.mockClear();
    abortWhiteboardRoomSwitch();

    expect(reset).not.toHaveBeenCalled();
    expect(isWhiteboardRoomSwitchPending()).toBe(false);
  });

  it('stops resetting an unregistered whiteboard sync', () => {
    const reset = vi.fn();
    const unregister = registerWhiteboardSyncReset(reset);

    unregister();
    beginWhiteboardRoomSwitch();

    expect(reset).not.toHaveBeenCalled();
  });

  it('keeps the latest registration when an outdated one is unregistered', () => {
    const outdatedReset = vi.fn();
    const currentReset = vi.fn();

    const unregisterOutdatedReset = registerWhiteboardSyncReset(outdatedReset);
    registerWhiteboardSyncReset(currentReset);
    unregisterOutdatedReset();

    beginWhiteboardRoomSwitch();

    expect(outdatedReset).not.toHaveBeenCalled();
    expect(currentReset).toHaveBeenCalledOnce();
  });
});
