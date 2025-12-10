// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, renderHook } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';

import { notifications } from '../commonComponents';
import { RootState } from '../store';
import { Timestamp } from '../types';
import { configureStore } from '../utils/testUtils';
import useRemainingDurationOfTimer from './useRemainingDurationOfTimer';

vi.mock('../commonComponents', () => ({
  notifications: {
    error: vi.fn(),
  },
}));

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

const renderUseRemainingDurationOfTimer = (initialState?: DeepPartial<RootState>) => {
  const { store } = configureStore({
    initialState,
  });

  return renderHook(() => useRemainingDurationOfTimer(), {
    wrapper: ({ children }) => <ReduxProvider store={store}>{children}</ReduxProvider>,
  });
};

describe('useRemainingDurationOfTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns remaining duration for timers with end date and updates every second', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T10:00:00Z'));

    const startTime = '2024-01-01T09:59:50Z' as Timestamp;
    const endTime = '2024-01-01T10:00:10Z' as Timestamp;

    const { result } = renderUseRemainingDurationOfTimer({
      room: {
        serverTimeOffset: 5000,
      },
      timer: {
        startedAt: startTime,
        endsAt: endTime,
        participantsReady: [],
      },
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toMatchObject({
      duration: expect.objectContaining({ seconds: 5 }),
      durationString: '00 : 05',
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toMatchObject({
      duration: expect.objectContaining({ seconds: 4 }),
      durationString: '00 : 04',
    });
  });

  it('counts up from start time when no end date is provided', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T10:00:05Z'));

    const startTime = '2024-01-01T10:00:00Z' as Timestamp;

    const { result } = renderUseRemainingDurationOfTimer({
      room: {
        serverTimeOffset: 0,
      },
      timer: {
        startedAt: startTime,
        participantsReady: [],
      },
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toMatchObject({
      duration: expect.objectContaining({ seconds: 5 }),
      durationString: '00 : 05',
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toMatchObject({
      duration: expect.objectContaining({ seconds: 6 }),
      durationString: '00 : 06',
    });
  });

  it('remains undefined when no start time is set', () => {
    const { result } = renderUseRemainingDurationOfTimer();

    expect(result.current).toBeUndefined();
    expect(notifications.error).not.toHaveBeenCalled();
  });
});
