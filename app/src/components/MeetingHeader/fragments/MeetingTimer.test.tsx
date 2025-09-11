// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { act } from 'react';
import { Mock } from 'vitest';

import { isDevMode } from '../../../utils/devMode';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingTimer from './MeetingTimer';

vi.useFakeTimers();

vi.mock('../../../utils/devMode', () => ({
  isDevMode: vi.fn(),
}));

const { store } = configureStore({
  initialState: {
    participants: {
      ids: ['1'],
      entities: {
        '1': {
          joinedAt: new Date('2025-01-01T00:00:00Z'),
        },
      },
    },
  },
});

describe('MeetingTimer rendering logic', () => {
  it('should render current meeting time on first render.', () => {
    vi.setSystemTime(new Date('2025-01-01T00:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store, provider: { mui: true } });
    expect(screen.getByText('03 : 14')).toBeInTheDocument();
  });

  it('should update meeting time every second.', () => {
    vi.setSystemTime(new Date('2025-01-01T00:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store, provider: { mui: true } });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('03 : 15')).toBeInTheDocument();
  });

  it('should prepend 00 : when the time is under 1 hour in dev mode.', () => {
    (isDevMode as Mock).mockReturnValue(true);
    vi.setSystemTime(new Date('2025-01-01T00:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store, provider: { mui: true } });
    expect(screen.getByText('00 : 03 : 14')).toBeInTheDocument();
  });

  it('should not prepend 00 : when the time is over 1 hour in dev mode.', () => {
    (isDevMode as Mock).mockReturnValue(true);
    vi.setSystemTime(new Date('2025-01-01T01:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store, provider: { mui: true } });
    expect(screen.getByText('01 : 03 : 14')).toBeInTheDocument();
  });

  it('should not prepend 00 : when the time is under 1 hour in production mode.', () => {
    (isDevMode as Mock).mockReturnValue(false);
    vi.setSystemTime(new Date('2025-01-01T00:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store, provider: { mui: true } });
    expect(screen.getByText('03 : 14')).toBeInTheDocument();
  });

  it('should use current time when meetingStartPoint is not set.', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [],
          entities: {},
        },
      },
    });
    vi.setSystemTime(new Date('2025-01-01T00:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store, provider: { mui: true } });
    expect(screen.getByText('00 : 00')).toBeInTheDocument();
  });
});
