// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { act } from 'react';

import { isDevMode } from '../../../utils/devMode';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingTimer from './MeetingTimer';

jest.useFakeTimers();

jest.mock('../../../utils/devMode', () => ({
  isDevMode: jest.fn(),
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
    jest.setSystemTime(new Date('2025-01-01T00:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store });
    expect(screen.getByText('03 : 14')).toBeInTheDocument();
  });

  it('should update meeting time every second.', () => {
    jest.setSystemTime(new Date('2025-01-01T00:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('03 : 15')).toBeInTheDocument();
  });

  it('should prepend 00 : when the time is under 1 hour in dev mode.', () => {
    (isDevMode as jest.Mock).mockReturnValue(true);
    jest.setSystemTime(new Date('2025-01-01T00:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store });
    expect(screen.getByText('00 : 03 : 14')).toBeInTheDocument();
  });

  it('should not prepend 00 : when the time is over 1 hour in dev mode.', () => {
    (isDevMode as jest.Mock).mockReturnValue(true);
    jest.setSystemTime(new Date('2025-01-01T01:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store });
    expect(screen.getByText('01 : 03 : 14')).toBeInTheDocument();
  });

  it('should not prepend 00 : when the time is under 1 hour in production mode.', () => {
    (isDevMode as jest.Mock).mockReturnValue(false);
    jest.setSystemTime(new Date('2025-01-01T00:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store });
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
    jest.setSystemTime(new Date('2025-01-01T00:03:14Z'));
    renderWithProviders(<MeetingTimer />, { store });
    expect(screen.getByText('00 : 00')).toBeInTheDocument();
  });
});
