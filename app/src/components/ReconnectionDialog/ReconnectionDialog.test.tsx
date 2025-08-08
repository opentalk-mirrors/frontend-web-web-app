// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock } from 'vitest';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { startMedia } from '../../store/commonActions';
import { abortedReconnection } from '../../store/slices/roomSlice';
import ReconnectionDialog from './ReconnectionDialog';

vi.mock('../../hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}));

vi.mock('../../store/slices/roomSlice', () => ({
  abortedReconnection: vi.fn(),
}));

vi.mock('../../store/commonActions', () => ({
  startMedia: vi.fn(),
}));

describe('ReconnectionDialog', () => {
  it('renders dialog with title and abort button', () => {
    render(<ReconnectionDialog />);
    expect(screen.getByText('reconnection-loop-dialogbox-title')).toBeInTheDocument();
    expect(screen.getByText('reconnection-loop-abort-button')).toBeInTheDocument();
  });

  it('dispatches actions to disable media and abort reconnection when abort button is clicked', async () => {
    const mockDispatch = vi.fn();
    (useAppDispatch as unknown as Mock).mockReturnValue(mockDispatch);
    (useAppSelector as unknown as Mock)
      .mockReturnValueOnce(true) // audioEnabled
      .mockReturnValueOnce(true); // videoEnabled

    render(<ReconnectionDialog />);
    await userEvent.click(screen.getByText('reconnection-loop-abort-button'));

    expect(mockDispatch).toHaveBeenCalledWith(startMedia({ kind: 'audioinput', enabled: false }));
    expect(mockDispatch).toHaveBeenCalledWith(startMedia({ kind: 'videoinput', enabled: false }));
    expect(mockDispatch).toHaveBeenCalledWith(abortedReconnection());
  });

  it('does not dispatch media disable actions if audio and video are already disabled', async () => {
    const mockDispatch = vi.fn();
    (useAppDispatch as unknown as Mock).mockReturnValue(mockDispatch);
    (useAppSelector as unknown as Mock)
      .mockReturnValueOnce(false) // audioEnabled
      .mockReturnValueOnce(false); // videoEnabled

    render(<ReconnectionDialog />);
    await userEvent.click(screen.getByText('reconnection-loop-abort-button'));

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(abortedReconnection());
  });
});
