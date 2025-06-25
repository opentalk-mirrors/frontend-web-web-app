// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, fireEvent } from '@testing-library/react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { startMedia } from '../../store/commonActions';
import { abortedReconnection } from '../../store/slices/roomSlice';
import ReconnectionDialog from './ReconnectionDialog';

jest.mock('../../hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../store/slices/roomSlice', () => ({
  abortedReconnection: jest.fn(),
}));

jest.mock('../../store/commonActions', () => ({
  startMedia: jest.fn(),
}));

describe('ReconnectionDialog', () => {
  it('renders dialog with title and abort button', () => {
    const { getByText } = render(<ReconnectionDialog />);
    expect(getByText('reconnection-loop-dialogbox-title')).toBeInTheDocument();
    expect(getByText('reconnection-loop-abort-button')).toBeInTheDocument();
  });

  it('dispatches actions to disable media and abort reconnection when abort button is clicked', () => {
    const mockDispatch = jest.fn();
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as unknown as jest.Mock)
      .mockReturnValueOnce(true) // audioEnabled
      .mockReturnValueOnce(true); // videoEnabled

    const { getByText } = render(<ReconnectionDialog />);
    fireEvent.click(getByText('reconnection-loop-abort-button'));

    expect(mockDispatch).toHaveBeenCalledWith(startMedia({ kind: 'audioinput', enabled: false }));
    expect(mockDispatch).toHaveBeenCalledWith(startMedia({ kind: 'videoinput', enabled: false }));
    expect(mockDispatch).toHaveBeenCalledWith(abortedReconnection());
  });

  it('does not dispatch media disable actions if audio and video are already disabled', () => {
    const mockDispatch = jest.fn();
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as unknown as jest.Mock)
      .mockReturnValueOnce(false) // audioEnabled
      .mockReturnValueOnce(false); // videoEnabled

    const { getByText } = render(<ReconnectionDialog />);
    fireEvent.click(getByText('reconnection-loop-abort-button'));

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(abortedReconnection());
  });
});
