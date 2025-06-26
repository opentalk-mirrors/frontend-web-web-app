// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { renderHook, act } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { useNavigate, MemoryRouter } from 'react-router-dom';

import { ConnectionState } from '../modules/WebRTC/ConferenceRoom';
import { roomReset } from '../store/slices/roomSlice';
import { configureStore } from '../utils/testUtils';
import useNavigateToHome from './useNavigateToHome';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

const setup = (connectionState: ConnectionState) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      room: {
        connectionState: connectionState,
      },
    },
  });

  const mockHangUp = jest.fn();
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
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('dispatches hangUp, roomReset and navigates if state is Waiting', async () => {
    const { dispatchSpy, mockHangUp } = setup(ConnectionState.Waiting);

    expect(mockHangUp).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, roomReset());
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('dispatches hangUp, roomReset and navigates if state is ReadyToEnter', () => {
    const { dispatchSpy, mockHangUp } = setup(ConnectionState.ReadyToEnter);

    expect(mockHangUp).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, roomReset());
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('dispatches only roomReset and navigates if state is other', () => {
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

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(roomReset());
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
