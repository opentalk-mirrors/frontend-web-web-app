// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, screen } from '@testing-library/react';
import { it, vi } from 'vitest';

import { RootState } from '../../../store';
import * as commonActions from '../../../store/commonActions';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import InactivityGuard from './InactivityGuard';

afterEach(() => {
  vi.clearAllTimers();
});

const changeMedia = vi.spyOn(commonActions, 'changeMedia');

describe('InactivityGuard', () => {
  const { store } = configureStore({
    initialState: {
      config: {
        meetingInactivityMediaDisableSeconds: 1,
        meetingInactivityWarningSeconds: 2,
      } as Partial<RootState['config']>,
      livekit: {
        mediaSettings: {
          microphoneEnabled: true,
        },
      } as Partial<RootState['livekit']>,
    } as Partial<RootState>,
  });

  it('renders component without crashing', async () => {
    renderWithProviders(<InactivityGuard />, { store, provider: { mui: true, snackbar: true } });
    expect(screen.queryByText('meeting-inactivity-warning-dialog-content')).not.toBeInTheDocument();
  });

  it('shows warning dialog after `MEETING_INACTIVITY_WARNING_SECONDS` seconds of inactivity', async () => {
    vi.useFakeTimers();
    renderWithProviders(<InactivityGuard />, { store, provider: { mui: true, snackbar: true } });
    act(() => {
      vi.advanceTimersByTime(2 * 1000);
    });
    expect(screen.getByText('meeting-inactivity-warning-dialog-content')).toBeInTheDocument();
  });

  it('should mute microphone after `MEETING_INACTIVITY_MEDIA_DISABLE_SECONDS` seconds of inactivity', async () => {
    vi.useFakeTimers();
    renderWithProviders(<InactivityGuard />, { store, provider: { mui: true, snackbar: true } });
    act(() => {
      vi.advanceTimersByTime(1 * 1000);
    });
    act(() => {
      expect(changeMedia).toHaveBeenCalledWith({ kind: 'audioinput', enabled: false });
    });
  });

  it('should turn off camera after `MEETING_INACTIVITY_MEDIA_DISABLE_SECONDS` seconds of inactivity', async () => {
    vi.useFakeTimers();
    renderWithProviders(<InactivityGuard />, { store, provider: { mui: true, snackbar: true } });
    act(() => {
      vi.advanceTimersByTime(1 * 1000);
    });
    act(() => {
      expect(changeMedia).toHaveBeenCalledWith({ kind: 'videoinput', enabled: false });
    });
  });
});
