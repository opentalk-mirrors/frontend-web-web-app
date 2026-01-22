// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as commonActions from '../../store/commonActions';
import { abortedReconnection } from '../../store/slices/roomSlice';
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
    const { store, dispatchSpy } = configureStore({
      initialState: {
        livekit: {
          mediaSettings: { microphoneEnabled: true, cameraEnabled: true },
        },
      },
    });
    const changeMediaSpy = vi.spyOn(commonActions, 'changeMedia');
    renderWithProviders(<ReconnectionDialog />, { store, provider: { mui: true, snackbar: true } });
    await userEvent.click(screen.getByText('reconnection-loop-abort-button'));

    expect(dispatchSpy).toHaveBeenCalledTimes(3);
    expect(changeMediaSpy).toHaveBeenNthCalledWith(1, { kind: 'audioinput', enabled: false });
    expect(changeMediaSpy).toHaveBeenNthCalledWith(2, { kind: 'videoinput', enabled: false });
    expect(dispatchSpy).toHaveBeenNthCalledWith(3, abortedReconnection());
  });

  it('does not dispatch media disable actions if audio and video are already disabled', async () => {
    const { store, dispatchSpy } = configureStore({
      initialState: {
        livekit: {
          mediaSettings: { microphoneEnabled: false, cameraEnabled: false },
        },
      },
    });
    const changeMediaSpy = vi.spyOn(commonActions, 'changeMedia');
    renderWithProviders(<ReconnectionDialog />, { store, provider: { mui: true, snackbar: true } });

    await userEvent.click(screen.getByText('reconnection-loop-abort-button'));

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(changeMediaSpy).not.toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(abortedReconnection());
  });
});
