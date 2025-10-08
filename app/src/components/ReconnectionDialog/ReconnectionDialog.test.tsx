// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import ReconnectionDialog from './ReconnectionDialog';

describe('ReconnectionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with title and abort button', () => {
    const { store } = configureStore();
    renderWithProviders(<ReconnectionDialog />, { store });

    expect(screen.getByText('reconnection-loop-dialogbox-title')).toBeInTheDocument();
    expect(screen.getByText('reconnection-loop-abort-button')).toBeInTheDocument();
  });

  it('dispatches actions to disable media and abort reconnection when abort button is clicked', async () => {
    const { store } = configureStore({
      initialState: {
        livekit: {
          mediaSettings: {
            microphoneEnabled: true,
            cameraEnabled: true,
          },
        },
      },
    });
    renderWithProviders(<ReconnectionDialog />, { store });

    await userEvent.click(screen.getByText('reconnection-loop-abort-button'));

    expect(store.getState().livekit.mediaSettings.microphoneEnabled).toBe(false);
    expect(store.getState().livekit.mediaSettings.cameraEnabled).toBe(false);

    expect(store.getState().room.reconnectTimerId).toBe(null);
    expect(store.getState().room.connectionState).toBe(ConnectionState.Left);
  });

  it('does not dispatch media disable actions if audio and video are already disabled', async () => {
    const { store } = configureStore({
      initialState: {
        livekit: {
          mediaSettings: {
            microphoneEnabled: false,
            cameraEnabled: false,
          },
        },
      },
    });
    renderWithProviders(<ReconnectionDialog />, { store });

    await userEvent.click(screen.getByText('reconnection-loop-abort-button'));

    expect(store.getState().room.reconnectTimerId).toBe(null);
    expect(store.getState().room.connectionState).toBe(ConnectionState.Left);
  });
});
