// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import roomReducer, { connectionClosed } from './roomSlice';

describe('roomSlice - connectionClosed', () => {
  const getConnectionStateAfterClose = (errorCode?: number) => {
    const initState = roomReducer(undefined, { type: '@@INIT' });
    const afterCloseState = roomReducer(initState, connectionClosed({ errorCode }));
    return afterCloseState.connectionState;
  };

  it('transitions to "Left" on a graceful close (no error code) so the lobby is shown after debriefing', () => {
    expect(getConnectionStateAfterClose(undefined)).toBe(ConnectionState.Left);
  });

  it('transitions to "Failed" when the connection closes with an error code', () => {
    expect(getConnectionStateAfterClose(1006)).toBe(ConnectionState.Failed);
  });
});
