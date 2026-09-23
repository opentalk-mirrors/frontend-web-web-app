// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { renderHook, act } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { useNavigate, MemoryRouter } from 'react-router-dom';
import { Mock } from 'vitest';

import { ConnectionState } from '../modules/WebRTC/ConferenceRoom';
import { cleanLocalTracks } from '../store/slices/livekitSlice';
import { roomReset } from '../store/slices/roomSlice';
import { configureStore } from '../utils/testUtils';
import useNavigateToHome from './useNavigateToHome';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
}));

const mockNavigate = vi.fn();

const setup = (connectionState: ConnectionState) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      room: {
        connectionState: connectionState,
      },
    },
  });

  const mockHangUp = vi.fn();
  dispatchSpy.mockImplementationOnce(mockHangUp);

  const { result } = renderHook(() => useNavigateToHome(), {
    wrapper: ({ children }) => (
      <ReduxProvider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </ReduxProvider>
    ),
  });

  act(() => {
    result.current();
  });

  return {
    dispatchSpy,
    mockHangUp,
  };
};

describe('useNavigateToHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  it('dispatches hangUp, cleanLocalTracks, roomReset and navigates if state is Waiting', async () => {
    const { dispatchSpy, mockHangUp } = setup(ConnectionState.Waiting);

    expect(mockHangUp).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, cleanLocalTracks());
    expect(dispatchSpy).toHaveBeenNthCalledWith(3, roomReset());
    expect(mockNavigate).toHaveBeenCalledExactlyOnceWith('/dashboard');
  });

  it('dispatches hangUp, cleanLocalTracks, roomReset and navigates if state is ReadyToEnter', () => {
    const { dispatchSpy, mockHangUp } = setup(ConnectionState.ReadyToEnter);

    expect(mockHangUp).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, cleanLocalTracks());
    expect(dispatchSpy).toHaveBeenNthCalledWith(3, roomReset());
    expect(mockNavigate).toHaveBeenCalledExactlyOnceWith('/dashboard');
  });

  it('dispatches cleanLocalTracks and roomReset and navigates if state is other', () => {
    const { store, dispatchSpy } = configureStore({
      initialState: {
        room: {
          connectionState: ConnectionState.Online,
        },
      },
    });

    const { result } = renderHook(() => useNavigateToHome(), {
      wrapper: ({ children }) => (
        <ReduxProvider store={store}>
          <MemoryRouter>{children}</MemoryRouter>
        </ReduxProvider>
      ),
    });

    act(() => {
      result.current();
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenNthCalledWith(1, cleanLocalTracks());
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, roomReset());
    expect(mockNavigate).toHaveBeenCalledExactlyOnceWith('/dashboard');
  });
});
